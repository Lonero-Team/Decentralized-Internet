'use strict'

const dgram = require('dgram')
const util = require('util')
const packet = require('dns-packet')
const events = require('events')

module.exports = DNS

function DNS (opts) {
  if (!(this instanceof DNS)) return new DNS(opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  const self = this

  this.retries = opts.retries || 5
  this.timeout = opts.timeout || 7500
  this.destroyed = false
  this.inflight = 0
  this.socket = opts.socket || dgram.createSocket('udp4')
  this._id = Math.ceil(Math.random() * 65535)
  this._ids = []
  this._queries = []
  this._interval = null
  this._triesArray = getTriesArray(this.retries) // default: [2, 4, 8, 16] = .5s, 1s, 2s, 4s

  this.socket.on('error', onerror)
  this.socket.on('message', onmessage)
  if (isListening(this.socket)) onlistening()
  else this.socket.on('listening', onlistening)
  this.socket.on('close', onclose)

  function onerror (err) {
    if (err.code === 'EACCES' || err.code === 'EADDRINUSE') self.emit('error', err)
    else self.emit('warning', err)
  }

  function onmessage (message, rinfo) {
    self._onmessage(message, rinfo)
  }

  function onlistening () {
    const timeSlices = self._triesArray.reduce(add, 0)
    self._interval = setInterval(ontimeout, Math.round(self.timeout / timeSlices))
    self.emit('listening')
  }

  function onclose () {
    self.emit('close')
  }

  function ontimeout () {
    self._ontimeout()
  }
}

util.inherits(DNS, events.EventEmitter)

DNS.RECURSION_DESIRED = DNS.prototype.RECURSION_DESIRED = packet.RECURSION_DESIRED
DNS.RECURSION_AVAILABLE = DNS.prototype.RECURSION_AVAILABLE = packet.RECURSION_AVAILABLE
DNS.TRUNCATED_RESPONSE = DNS.prototype.TRUNCATED_RESPONSE = packet.TRUNCATED_RESPONSE
DNS.AUTHORITATIVE_ANSWER = DNS.prototype.AUTHORITATIVE_ANSWER = packet.AUTHORITATIVE_ANSWER
DNS.AUTHENTIC_DATA = DNS.prototype.AUTHENTIC_DATA = packet.AUTHENTIC_DATA
DNS.CHECKING_DISABLED = DNS.prototype.CHECKING_DISABLED = packet.CHECKING_DISABLED

DNS.prototype.address = function () {
  return this.socket.address()
}

DNS.prototype.bind = function (port, onlistening) {
  if (onlistening) this.once('listening', onlistening)
  this.socket.bind(port)
}

DNS.prototype.destroy = function (onclose) {
  if (onclose) this.once('close', onclose)
  if (this.destroyed) return
  this.destroyed = true
  clearInterval(this._interval)
  this.socket.close()
  for (let i = 0; i < this._queries.length; i++) {
    const q = this._queries[i]
    if (q) q.callback(new Error('Socket destroyed'))
  }
  this._queries = []
  this._ids = []
  this.inflight = 0
}

DNS.prototype._ontimeout = function () {
  for (let i = 0; i < this._queries.length; i++) {
    const q = this._queries[i]
    if (!q) continue
    if (!q.tries.length) {
      this._queries[i] = null
      this._ids[i] = 0
      this.inflight--
      this.emit('timeout', q.query, q.port, q.host)
      q.callback(new Error('Query timed out'))
      continue
    }
    if (--q.tries[0]) continue
    q.tries.shift()
    this.socket.send(q.buffer, 0, q.buffer.length, q.port, q.host)
  }
  this._trim()
}

DNS.prototype._onmessage = function (buffer, rinfo) {
  let message

  try {
    message = packet.decode(buffer)
  } catch (err) {
    this.emit('warning', err)
    return
  }

  if (message.type === 'response' && message.id) {
    const i = this._ids.indexOf(message.id)
    const q = i > -1 ? this._queries[i] : null
    if (q) {
      this.inflight--
      this._ids[i] = 0
      this._queries[i] = null
      this._trim()
      q.callback(null, message, q.query, rinfo.port, rinfo.address)
    }
  }

  this.emit(message.type, message, rinfo.port, rinfo.address)
}

DNS.prototype._trim = function () {
  while (this._ids.length && !this._ids[this._ids.length - 1]) {
    this._ids.pop()
    this._queries.pop()
  }
}

DNS.prototype.unref = function () {
  this.socket.unref()
}

DNS.prototype.ref = function () {
  this.socket.ref()
}

DNS.prototype.response = function (query, response, port, host) {
  if (this.destroyed) return

  response.type = 'response'
  response.id = query.id

  const buffer = packet.encode(response)
  this.socket.send(buffer, 0, buffer.length, port, host || '127.0.0.1')
}

DNS.prototype.cancel = function (id) {
  const i = this._ids.indexOf(id)
  const q = this._queries[i]
  if (!q) return

  this._queries[i] = null
  this._ids[i] = 0
  this.inflight--
  q.callback(new Error('Query cancelled'))
}

DNS.prototype.setRetries = function (id, retries) {
  const i = this._ids.indexOf(id)
  const q = this._queries[i]
  if (!q) return

  while (q.tries.length < retries) {
    q.tries.push(q.tries.length ? 2 * q.tries[q.tries.length - 1] : 4)
  }
  if (q.tries.length > retries) {
    q.tries = q.tries.slice(0, retries)
  }
}

DNS.prototype.query = function (query, port, host, cb) {
  if (typeof host === 'function') return this.query(query, port, null, host)
  if (!cb) cb = noop

  if (this.destroyed) {
    nextTick(cb, new Error('Socket destroyed'))
    return 0
  }

  this.inflight++
  query.type = 'query'
  query.flags = typeof query.flags === 'number' ? query.flags : DNS.RECURSION_DESIRED
  const id = query.id = this._id++
  if (this._id === 65535) this._id = 1

  let i = this._ids.indexOf(0)
  if (i === -1) i = this._ids.push(0) - 1
  if (this._queries.length === i) this._queries.push(null)

  const buffer = packet.encode(query)
  const tries = this._triesArray.slice(0)

  this._ids[i] = id
  this._queries[i] = {
    callback: cb,
    tries: tries,
    query: query,
    buffer: buffer,
    port: port,
    host: host
  }

  this.socket.send(buffer, 0, buffer.length, port, host || '127.0.0.1')
  return id
}

function noop () {}

function nextTick (cb, err) {
  process.nextTick(function () {
    cb(err)
  })
}

function add (a, b) {
  return a + b
}

function getTriesArray (retries) {
  const ret = []
  if (retries <= 1) return ret
  for (let i = 1; i <= retries - 1; i++) {
    ret.push(Math.pow(2, i))
  }
  return ret
}

function isListening (socket) {
  try {
    return socket.address().port !== 0
  } catch (err) {
    return false
  }
}
