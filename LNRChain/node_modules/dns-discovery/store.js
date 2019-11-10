var set = require('unordered-set')
var lru = require('lru')

module.exports = Store

function Store (opts) {
  if (!(this instanceof Store)) return new Store(opts)
  if (!opts) opts = {}

  this.maxValues = opts.values || Infinity
  this.maxEntries = opts.records || Infinity
  this.entries = lru(this.maxEntries)
  this.limit = opts.limit || 10000
  this.ttl = (opts.ttl || 0) * 1000
  this.used = 0
}

Store.prototype.get = function (name, max) {
  var entry = this.entries.get(name)
  var result = []

  if (!entry) return result
  if (!max) max = entry.values.length

  while (result.length < max) {
    var i = result.length
    if (i >= entry.values.length) return result

    var missing = entry.values.length - i
    var next = i + (Math.random() * missing) | 0
    var val = entry.values[next]

    if (this.ttl && (Date.now() - val._modified) > this.ttl) {
      set.remove(entry.values, val)
      this.used--

      if (!entry.values.length) {
        this.entries.remove(name)
        return result
      }
    } else {
      set.swap(entry.values, entry.values[i], val)
      result.push(val)
    }
  }

  return result
}

Store.prototype.remove = function (name, port, host) {
  var address = host + ':' + port
  var entry = this.entries.peek(name)
  if (!entry) return

  var peer = entry.byAddr.remove(address)
  if (!peer) return

  set.remove(entry.values, peer)
  this.used--
  if (!entry.values.length) this.entries.remove(name)
}

Store.prototype.add = function (name, port, host) {
  var peer = new Peer(port, host)

  if (this.used >= this.limit) this.evict()

  var entry = this.entries.get(name)

  if (!entry) {
    entry = this.entries.set(name, new Record(name, this.maxValues))
  }

  var prev = entry.byAddr.get(peer.address)
  var old = !!prev
  if (!old) {
    prev = peer
    set.add(entry.values, peer)
    entry.byAddr.set(peer.address, peer)
    this.used++
  }
  if (this.ttl) prev._modified = Date.now()

  return !old
}

Store.prototype.evict = function () {
  var oldest = this.entries.tail && this.entries.peek(this.entries.tail)
  if (!oldest) return

  var oldestPeer = oldest.byAddr.tail && oldest.byAddr.remove(oldest.byAddr.tail)
  if (!oldestPeer) return

  set.remove(oldest.values, oldestPeer)
  this.used--

  if (!oldest.values.length) {
    this.entries.remove(this.entries.tail)
  }
}

Store.prototype.toJSON = function () {
  var entries = []
  var keys = Object.keys(this.entries.cache)
  for (var i = 0; i < keys.length; i++) {
    entries.push({
      name: keys[i],
      records: this.entries.peek(keys[i]).values
    })
  }
  return entries
}

Store.prototype.getTopKeyStats = function (n) {
  n = n || 10
  var entries = []
  var keys = Object.keys(this.entries.cache)
  for (var i = 0; i < keys.length; i++) {
    entries.push({
      name: keys[i],
      numRecords: this.entries.peek(keys[i]).values.length
    })
  }
  entries.sort(function (a, b) {
    return b.numRecords - a.numRecords
  })
  return entries.slice(0, n)
}

function Peer (port, host) {
  this.host = host || '127.0.0.1'
  this.port = port
  this.address = this.host + ':' + this.port
  this.buffer = null

  this._modified = 0
  this._index = 0
}

function Record (name, limit) {
  this.name = name
  this.values = []
  this.byAddr = lru(limit || Infinity)
}
