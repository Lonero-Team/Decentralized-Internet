'use strict'

const EventEmitter = require('events')
const old = require('old')
const { expandTarget, compressTarget } = require('bitcoin-util')
const { types } = require('bitcoin-protocol')
const createHash = require('create-hash')
const BN = require('bn.js')
const MapDeque = require('map-deque')

const retargetInterval = 2016
const targetSpacing = 10 * 60 // 10 minutes
const targetTimespan = retargetInterval * targetSpacing
const maxTimeIncrease = 8 * 60 * 60 // 8 hours
const maxTarget = expandTarget(0x1d00ffff)
const maxReorgDepth = retargetInterval

// TODO: keep track of chain work so we can use most-work chain
//       instead of longest chain. not a security flaw right now
//       because we don't allow reorgs larger than the retarget
//       interval.

class Blockchain extends EventEmitter {
  constructor (opts = {}) {
    super()

    this.store = opts.store || []
    this.indexed = opts.indexed

    // should only be changed in tests, when we want really easy mining
    this.maxTarget = opts.maxTarget || maxTarget
    this.maxTargetBn = new BN(this.maxTarget.toString('hex'), 'hex')
    this.maxTargetBits = compressTarget(this.maxTarget)

    // should only be set for testnets/regtest
    this.allowMinDifficultyBlocks = opts.allowMinDifficultyBlocks
    this.noRetargeting = opts.noRetargeting

    // initialize with starting header if the store is empty
    if (this.store.length === 0) {
      if (opts.start == null) {
        throw Error('Must specify starting header')
      }
      this.store.push(opts.start)
    }

    if (this.indexed) {
      // index blocks by hash
      this.index = new MapDeque()
      for (let header of this.store) {
        let hexHash = getHash(header).toString('hex')
        this.index.push(hexHash, header)
      }
    }
  }

  // TODO: ensure headers aren't too far ahead of current time
  add (headers) {
    // ensure 'headers' is an array
    if (!Array.isArray(headers)) {
      throw Error('Argument must be an array of block headers')
    }

    // make sure first header isn't higher than our tip + 1
    if (headers[0].height > this.height() + 1) {
      throw Error('Start of headers is ahead of chain tip')
    }

    // make sure last header is higher than current tip
    if (headers[headers.length - 1].height <= this.height()) {
      throw Error('New tip is not higher than current tip')
    }

    // make sure we aren't reorging longer than max reorg depth
    // (otherwise longest chain isn't necessarily most-work chain)
    if (headers[0].height < this.height() - maxReorgDepth) {
      throw Error(`Reorg deeper than ${maxReorgDepth} blocks`)
    }

    // get list of blocks which will be reorged (usually none)
    let index = headers[0].height - this.store[0].height
    let toRemove = this.store.slice(index)

    // make sure we this isn't a fake reorg (including headers which are already in the chain)
    if (toRemove.length > 0 && getHash(headers[0]).equals(getHash(toRemove[0]))) {
      throw Error('Headers overlap with current chain')
    }

    // make sure headers are connected to each other and our chain,
    // and have valid PoW, timestamps, etc.
    this.verifyHeaders(headers)

    // remove any blocks which got reorged away
    this.store.splice(this.store.length - toRemove.length, toRemove.length)
    if (this.indexed) {
      for (let i = 0; i < toRemove.length; i++) {
        this.index.pop()
      }
    }

    // add the headers
    this.store.push(...headers)

    // index headers by hash
    if (this.indexed) {
      for (let header of headers) {
        let hexHash = getHash(header).toString('hex')
        this.index.push(hexHash, header)
        if (this.index.length > maxReorgDepth) {
          this.index.shift()
        }
      }
    }

    // emit events
    if (toRemove.length > 0) {
      this.emit('reorg', {
        remove: toRemove.reverse(),
        add: headers
      })
    }
    this.emit('headers', headers)
  }

  getByHeight (height, extra) {
    // `extra` is an optional array of headers,
    // if the height is in `extra`'s range, it will
    // get the header from there instead of the store

    // if extra is not given or not in range,
    // get header from store
    if (extra == null || height < extra[0].height) {
      extra = this.store
    }

    let index = height - extra[0].height
    let header = extra[index]
    if (header == null) {
      throw Error('Header not found')
    }
    return header
  }

  getByHash (hash) {
    if (!this.indexed) {
      throw Error('Indexing disabled, try instantiating with `indexed: true`')
    }
    let header = this.index.get(hash.toString('hex'))
    if (header == null) {
      throw Error('Header not found')
    }
    return header
  }

  height () {
    return this.store[this.store.length - 1].height
  }

  verifyHeaders (headers) {
    for (let header of headers) {
      let prev = this.getByHeight(header.height - 1, headers)

      if (header.height !== prev.height + 1) {
        throw Error('Expected height to be one higher than previous')
      }

      if (!header.prevHash.equals(getHash(prev))) {
        throw Error('Header not connected to previous')
      }

      // time must be greater than median of last 11 timestamps
      // TODO: optimize by persisting arrays of sorted timestamps and sequential headers
      let prevEleven = []
      for (let i = 11; i > 0; i--) {
        let height = Math.max(header.height - i, this.store[0].height)
        prevEleven.push(this.getByHeight(height, headers))
      }
      prevEleven = prevEleven.map(({ timestamp }) => timestamp).sort()
      let medianTimestamp = prevEleven[5]
      // we use !> instead of <= to ensure we fail on non-number timestamp values
      if (!(header.timestamp > medianTimestamp)) {
        throw Error('Timestamp is not greater than median of previous 11 timestamps')
      }

      // time must be within a certain bound of prev timestamp,
      // to prevent attacks where an attacker uses a time far in the future
      // in order to bring down the difficulty and create a longer.
      // ignored if retargeting is turned off (e.g. in tests)
      if (!this.noRetargeting && Math.abs(header.timestamp - prev.timestamp) > maxTimeIncrease) {
        throw Error('Timestamp is too far ahead of previous timestamp')
      }

      // handle difficulty adjustments
      let shouldRetarget = header.height % retargetInterval === 0
      let prevTarget = expandTarget(prev.bits)
      let expectedBits
      if (shouldRetarget && !this.noRetargeting) {
        // make sure the retarget happened correctly
        let prevRetarget = this.getByHeight(header.height - retargetInterval, headers)
        let timespan = prev.timestamp - prevRetarget.timestamp
        let target = calculateTarget(timespan, prevTarget, this.maxTarget, this.maxTargetBn)
        expectedBits = compressTarget(target)
      } else if (this.allowMinDifficultyBlocks && !this.noRetargeting) {
        // special rule for testnet,
        // sets difficulty to minimum if timestamp is 20 mins after previous
        if (header.timestamp > prev.timestamp + targetSpacing * 2) {
          expectedBits = this.maxTargetBits
        } else {
          // look backwards for first non-minimum difficulty
          let cursor = prev
          while (
            cursor.height % retargetInterval !== 0 &&
            cursor.bits === this.maxTargetBits
          ) {
            cursor = this.getByHeight(cursor.height - 1, headers)
          }
          expectedBits = cursor.bits
        }
      } else {
        expectedBits = prev.bits
      }

      // ensure header specifies correct difficulty
      if (header.bits !== expectedBits) {
        throw Error('Incorrect difficulty')
      }

      // check PoW
      // bitcoin protocol uses the hash in
      // little-endian (reversed)
      let target = expandTarget(header.bits)
      let hash = getHash(header).reverse()
      if (hash.compare(target) === 1) {
        throw Error('Hash is above target')
      }
    }
  }
}

module.exports = old(Blockchain)
Object.assign(module.exports, {
  getHash,
  calculateTarget
})

function sha256 (data) {
  return createHash('sha256').update(data).digest()
}

function getHash (header) {
  let bytes = types.header.encode(header)
  return sha256(sha256(bytes))
}

// calculates new PoW target hash/difficulty based
// on time since previous adjustment,
// and the previous targert
function calculateTarget (timespan, prevTarget, maxTarget, maxTargetBn) {
  // bound adjustment so attackers can't use an extreme timespan
  timespan = Math.max(timespan, targetTimespan / 4)
  timespan = Math.min(timespan, targetTimespan * 4)

  // target = prevTarget * timespan / targetTimespan
  let targetBn = new BN(prevTarget.toString('hex'), 'hex')
  targetBn.imuln(timespan)
  targetBn.idivn(targetTimespan)

  // target can't be higher than maxTarget
  if (targetBn.cmp(maxTargetBn) === 1) {
    return maxTarget
  }

  // convert target to Buffer
  let targetHex = targetBn.toString('hex')
  targetHex = targetHex.padStart(64, '0')
  let target = Buffer.from(targetHex, 'hex')
  return target
}
