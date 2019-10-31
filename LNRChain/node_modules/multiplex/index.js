var stream = require('readable-stream')
var varint = require('varint')
var EventEmitter = require('events').EventEmitter
var xtend = require('xtend')
var inherits = require('inherits')
var duplexify = require('duplexify')

var SIGNAL_FLUSH = new Buffer([0])

var empty = new Buffer(0)
var pool = new Buffer(10 * 1024)
var used = 0

var Channel = function (name, plex, opts) {
  if (!opts) opts = {}
  stream.Duplex.call(this)

  this.name = name
  this.channel = 0
  this.initiator = false
  this.chunked = !!opts.chunked
  this.halfOpen = !!opts.halfOpen
  this.destroyed = false
  this.finalized = false

  this._multiplex = plex
  this._dataHeader = 0
  this._opened = false
  this._awaitDrain = 0
  this._lazy = !!opts.lazy

  var finished = false
  var ended = false

  this.once('end', function () {
    this._read() // trigger drain
    if (this.destroyed) return
    ended = true
    if (finished) this._finalize()
    else if (!this.halfOpen) this.end()
  })

  this.once('finish', function onfinish () {
    if (this.destroyed) return
    if (!this._opened) {
      this.once('open', onfinish)
    } else {
      if (this._lazy && this.initiator) this._open()
      this._multiplex._send(this.channel << 3 | (this.initiator ? 4 : 3), null)
      finished = true
      if (ended) this._finalize()
    }
  })
}

inherits(Channel, stream.Duplex)

Channel.prototype.destroy = function (err) {
  this._destroy(err, true)
}

Channel.prototype._destroy = function (err, local) {
  if (this.destroyed) return
  this.destroyed = true
  if (err && (!local || EventEmitter.listenerCount(this, 'error'))) this.emit('error', err)
  this.emit('close')
  if (local && this._opened) {
    if (this._lazy && this.initiator) this._open()
    try {
      this._multiplex._send(this.channel << 3 | (this.initiator ? 6 : 5), err ? new Buffer(err.message) : null)
    } catch (e) {}
  }
  this._finalize()
}

Channel.prototype._finalize = function () {
  if (this.finalized) return
  this.finalized = true
  this.emit('finalize')
}

Channel.prototype._write = function (data, enc, cb) {
  if (!this._opened) {
    this.once('open', this._write.bind(this, data, enc, cb))
    return
  }
  if (this.destroyed) return cb()

  if (this._lazy && this.initiator) this._open()

  var drained = this._multiplex._send(this._dataHeader, data)
  if (drained) cb()
  else this._multiplex._ondrain.push(cb)
}

Channel.prototype._read = function () {
  if (this._awaitDrain) {
    var drained = this._awaitDrain
    this._awaitDrain = 0
    this._multiplex._onchanneldrain(drained)
  }
}

Channel.prototype._open = function () {
  var buf = null
  if (Buffer.isBuffer(this.name)) buf = this.name
  else if (this.name !== this.channel.toString()) buf = new Buffer(this.name)
  this._lazy = false
  this._multiplex._send(this.channel << 3 | 0, buf)
}

Channel.prototype.open = function (channel, initiator) {
  this.channel = channel
  this.initiator = initiator
  this._dataHeader = channel << 3 | (initiator ? 2 : 1)
  this._opened = true
  if (!this._lazy && this.initiator) this._open()
  this.emit('open')
}

var Multiplex = function (opts, onchannel) {
  if (!(this instanceof Multiplex)) return new Multiplex(opts, onchannel)
  stream.Duplex.call(this)

  if (typeof opts === 'function') {
    onchannel = opts
    opts = null
  }
  if (!opts) opts = {}
  if (onchannel) this.on('stream', onchannel)

  this.destroyed = false
  this.limit = opts.limit || 0

  this._corked = 0
  this._options = opts
  this._binaryName = !!opts.binaryName
  this._local = []
  this._remote = []
  this._list = this._local
  this._receiving = null
  this._chunked = false
  this._state = 0
  this._type = 0
  this._channel = 0
  this._missing = 0
  this._message = null
  this._buf = new Buffer(this.limit ? varint.encodingLength(this.limit) : 100)
  this._ptr = 0
  this._awaitChannelDrains = 0
  this._onwritedrain = null
  this._ondrain = []
  this._finished = false

  this.on('finish', this._clear)
}

inherits(Multiplex, stream.Duplex)

Multiplex.prototype.createStream = function (name, opts) {
  if (this.destroyed) throw new Error('Multiplexer is destroyed')
  var id = this._local.indexOf(null)
  if (id === -1) id = this._local.push(null) - 1
  var channel = new Channel(this._name(name || id.toString()), this, xtend(this._options, opts))
  return this._addChannel(channel, id, this._local)
}

Multiplex.prototype.receiveStream = function (name, opts) {
  if (this.destroyed) throw new Error('Multiplexer is destroyed')
  if (name === undefined || name === null) throw new Error('Name is needed when receiving a stream')
  var channel = new Channel(this._name(name), this, xtend(this._options, opts))
  if (!this._receiving) this._receiving = {}
  if (this._receiving[channel.name]) throw new Error('You are already receiving this stream')
  this._receiving[channel.name] = channel
  return channel
}

Multiplex.prototype.createSharedStream = function (name, opts) {
  return duplexify(this.createStream(name, xtend(opts, {lazy: true})), this.receiveStream(name, opts))
}

Multiplex.prototype._name = function (name) {
  if (!this._binaryName) return name.toString()
  return Buffer.isBuffer(name) ? name : new Buffer(name)
}

Multiplex.prototype._send = function (header, data) {
  var len = data ? data.length : 0
  var oldUsed = used
  var drained = true

  varint.encode(header, pool, used)
  used += varint.encode.bytes
  varint.encode(len, pool, used)
  used += varint.encode.bytes

  drained = this.push(pool.slice(oldUsed, used))

  if (pool.length - used < 100) {
    pool = new Buffer(10 * 1024)
    used = 0
  }

  if (data) drained = this.push(data)
  return drained
}

Multiplex.prototype._addChannel = function (channel, id, list) {
  while (list.length <= id) list.push(null)
  list[id] = channel
  channel.on('finalize', function () {
    list[id] = null
  })

  channel.open(id, list === this._local)

  return channel
}

Multiplex.prototype._writeVarint = function (data, offset) {
  for (offset; offset < data.length; offset++) {
    if (this._ptr === this._buf.length) return this._lengthError(data)
    this._buf[this._ptr++] = data[offset]
    if (!(data[offset] & 0x80)) {
      if (this._state === 0) {
        var header = varint.decode(this._buf)
        this._type = header & 7
        this._channel = header >> 3
        this._list = this._type & 1 ? this._local : this._remote
        var chunked = this._list.length > this._channel && this._list[this._channel] && this._list[this._channel].chunked
        this._chunked = !!(this._type === 1 || this._type === 2) && chunked
      } else {
        this._missing = varint.decode(this._buf)
        if (this.limit && this._missing > this.limit) return this._lengthError(data)
      }
      this._state++
      this._ptr = 0
      return offset + 1
    }
  }
  return data.length
}

Multiplex.prototype._lengthError = function (data) {
  this.destroy(new Error('Incoming message is too big'))
  return data.length
}

Multiplex.prototype._writeMessage = function (data, offset) {
  var free = data.length - offset
  var missing = this._missing

  if (!this._message) {
    if (missing <= free) { // fast track - no copy
      this._missing = 0
      this._push(data.slice(offset, offset + missing))
      return offset + missing
    }
    if (this._chunked) {
      this._missing -= free
      this._push(data.slice(offset, data.length))
      return data.length
    }
    this._message = new Buffer(missing)
  }

  data.copy(this._message, this._ptr, offset, offset + missing)

  if (missing <= free) {
    this._missing = 0
    this._push(this._message)
    return offset + missing
  }

  this._missing -= free
  this._ptr += free

  return data.length
}

Multiplex.prototype._push = function (data) {
  if (!this._missing) {
    this._ptr = 0
    this._state = 0
    this._message = null
  }

  if (this._type === 0) { // open
    if (this.destroyed || this._finished) return

    var name = this._binaryName ? data : (data.toString() || this._channel.toString())
    var channel

    if (this._receiving && this._receiving[name]) {
      channel = this._receiving[name]
      delete this._receiving[name]
      this._addChannel(channel, this._channel, this._list)
    } else {
      channel = new Channel(name, this, this._options)
      this.emit('stream', this._addChannel(channel, this._channel, this._list), channel.name)
    }
    return
  }

  var stream = this._list[this._channel]
  if (!stream) return

  switch (this._type) {
    case 5: // local error
    case 6: // remote error
    stream._destroy(new Error(data.toString() || 'Channel destroyed'), false)
    return

    case 3: // local end
    case 4: // remote end
    stream.push(null)
    return

    case 1: // local packet
    case 2: // remote packet
    if (!stream.push(data)) {
      this._awaitChannelDrains++
      stream._awaitDrain++
    }
    return
  }
}

Multiplex.prototype._onchanneldrain = function (drained) {
  this._awaitChannelDrains -= drained
  if (this._awaitChannelDrains) return
  var ondrain = this._onwritedrain
  this._onwritedrain = null
  if (ondrain) ondrain()
}

Multiplex.prototype._write = function (data, enc, cb) {
  if (this._finished) return cb()
  if (this._corked) return this._onuncork(this._write.bind(this, data, enc, cb))
  if (data === SIGNAL_FLUSH) return this._finish(cb)

  var offset = 0

  while (offset < data.length) {
    if (this._state === 2) offset = this._writeMessage(data, offset)
    else offset = this._writeVarint(data, offset)
  }
  if (this._state === 2 && !this._missing) this._push(empty)

  if (this._awaitChannelDrains) this._onwritedrain = cb
  else cb()
}

Multiplex.prototype._finish = function (cb) {
  var self = this
  this._onuncork(function () {
    if (self._writableState.prefinished === false) self._writableState.prefinished = true
    self.emit('prefinish')
    self._onuncork(cb)
  })
}

Multiplex.prototype.cork = function () {
  if (++this._corked === 1) this.emit('cork')
}

Multiplex.prototype.uncork = function () {
  if (this._corked && --this._corked === 0) this.emit('uncork')
}

Multiplex.prototype.end = function (data, enc, cb) {
  if (typeof data === 'function') return this.end(null, null, data)
  if (typeof enc === 'function') return this.end(data, null, enc)
  if (data) this.write(data)
  if (!this._writableState.ending) this.write(SIGNAL_FLUSH)
  return stream.Writable.prototype.end.call(this, cb)
}

Multiplex.prototype._onuncork = function (fn) {
  if (this._corked) this.once('uncork', fn)
  else fn()
}

Multiplex.prototype._read = function () {
  while (this._ondrain.length) this._ondrain.shift()()
}

Multiplex.prototype._clear = function () {
  if (this._finished) return
  this._finished = true

  var list = this._local.concat(this._remote)

  this._local = []
  this._remote = []

  list.forEach(function (stream) {
    if (stream) stream._destroy(null, false)
  })

  this.push(null)
}

Multiplex.prototype.finalize = function () {
  this._clear()
}

Multiplex.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  this._clear()
  if (err) this.emit('error', err)
  this.emit('close')
}

module.exports = Multiplex
