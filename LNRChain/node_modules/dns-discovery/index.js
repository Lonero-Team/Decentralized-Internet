var dns = require('dns-socket')
var events = require('events')
var util = require('util')
var crypto = require('crypto')
var network = require('network-address')
var multicast = require('multicast-dns')
var debug = require('debug')('dns-discovery')
var store = require('./store')

var IPv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3}$/
var PORT = /^\d{1,5}$/

const TYPE_LOOKUP = 1
const TYPE_ANNOUNCE = 2
const TYPE_UNANNOUNCE = 3

module.exports = DNSDiscovery

function DNSDiscovery (opts) {
  if (!(this instanceof DNSDiscovery)) return new DNSDiscovery(opts)
  if (!opts) opts = {}

  events.EventEmitter.call(this)

  var self = this

  this.socket = dns(opts)
  this.servers = [].concat(opts.servers || opts.server || []).map(parseAddr)

  this._sockets = []
  this._onsocket(this.socket)

  this.multicast = opts.multicast !== false ? (isMulticaster(opts.multicast) ? opts.multicast : multicast()) : null
  if (this.multicast) {
    this.multicast.on('query', onmulticastquery)
    this.multicast.on('response', onmulticastresponse)
    this.multicast.on('error', onerror)
  }

  this._loopback = !!opts.loopback
  this._listening = false
  this._id = crypto.randomBytes(32).toString('base64')
  this._domain = opts.domain || 'dns-discovery.local'
  this._pushDomain = 'push.' + this._domain
  this._tokens = new Array(this.servers.length)
  this._tokensAge = []
  this._secrets = [
    crypto.randomBytes(32),
    crypto.randomBytes(32)
  ]

  while (this._tokensAge.length < this._tokens.length) this._tokensAge.push(0)

  this._interval = setInterval(rotateSecrets, 5 * 60 * 1000)
  if (this._interval.unref) this._interval.unref()

  this._ttl = opts.ttl || 0
  this._tick = 1

  var push = opts.push || {}
  if (!push.ttl) push.ttl = opts.ttl || 60
  if (!push.limit) push.limit = opts.limit

  this._domainStore = store(opts)
  this._pushStore = store(push)

  function rotateSecrets () {
    self._rotateSecrets()
  }

  function onerror (err) {
    debug('Error', err)
    self.emit('error', err)
  }

  function onmulticastquery (message, rinfo) {
    debug(
      'MDNS query %s:%s %dQ %dA +%d',
      rinfo.address, rinfo.port,
      message.questions.length,
      message.answers.length,
      message.additionals.length
    )
    self.emit('traffic', 'in:multicastquery', {message: message, peer: rinfo})
    self._onmulticastquery(message, rinfo.port, rinfo.address)
  }

  function onmulticastresponse (message, rinfo) {
    debug(
      'MDNS response %s:%s %dA +%d',
      rinfo.address, rinfo.port,
      message.answers.length,
      message.additionals.length
    )
    self.emit('traffic', 'in:multicastresponse', {message: message, peer: rinfo})
    self._onmulticastresponse(message, rinfo.port, rinfo.address)
  }
}

util.inherits(DNSDiscovery, events.EventEmitter)

DNSDiscovery.prototype.toJSON = function () {
  return this._domainStore.toJSON()
}

DNSDiscovery.prototype._onsocket = function (socket) {
  var self = this

  this._sockets.push(socket)
  socket.on('query', onquery)
  socket.on('error', onerror)

  function onerror (err) {
    debug('Error', err)
    self.emit('error', err)
  }

  function onquery (message, port, host) {
    debug(
      'DNS query %s:%s %dQ %dA +%d',
      host, port,
      message.questions.length,
      message.answers.length,
      message.additionals.length
    )
    self.emit('traffic', 'in:query', {message: message, peer: {port: port, host: host}})
    self._onquery(message, port, host, socket)
  }
}

DNSDiscovery.prototype._rotateSecrets = function () {
  if (this._listening) {
    debug('Rotating secrets')
    this._secrets.shift()
    this._secrets.push(crypto.randomBytes(32))
  }

  for (var i = 0; i < this._tokensAge.length; i++) {
    if (this._tokensAge[i] < this._tick) {
      this._tokens[i] = null
      this._tokensAge[i] = 0
    }
  }

  this.emit('secrets-rotated')
  this._tick++
}

DNSDiscovery.prototype._onmulticastquery = function (query, port, host) {
  var reply = {questions: query.questions, answers: []}
  var i = 0

  for (i = 0; i < query.questions.length; i++) {
    this._onquestion(query.questions[i], port, host, reply.answers, true)
  }
  for (i = 0; i < query.answers.length; i++) {
    this._onanswer(query.answers[i], port, host, null)
  }
  for (i = 0; i < query.additionals.length; i++) {
    this._onanswer(query.additionals[i], port, host, null)
  }

  if (reply.answers.length) {
    this.emit('traffic', 'out:multicastresponse', {message: reply})
    this.multicast.response(reply, {port: port})
  }
}

DNSDiscovery.prototype._onmulticastresponse = function (response, port, host) {
  var i = 0

  for (i = 0; i < response.answers.length; i++) {
    this._onanswer(response.answers[i], port, host, null)
  }
  for (i = 0; i < response.additionals.length; i++) {
    this._onanswer(response.additionals[i], port, host, null)
  }
}

DNSDiscovery.prototype._onanswer = function (answer, port, host, socket) {
  var domain = parseDomain(answer.name)
  var id = parseId(answer.name, domain)
  if (!id) {
    debug('Invalid ID in answer, discarding', { name: answer.name, domain: domain, host: host, port: port })
    return
  }

  if (answer.type === 'SRV') {
    if (!IPv4.test(answer.data.target)) return
    var peer = {
      port: answer.data.port || port,
      host: answer.data.target === '0.0.0.0' ? host : answer.data.target
    }
    debug('Announce received via SRV', id, peer.host + ':' + 'peer.port')
    this.emit('peer', id, peer)
    return
  }

  if (answer.type === 'TXT') {
    try {
      var data = decodeTxt(answer.data)
    } catch (err) {
      return
    }

    var tokenMatch = data.token === hash(this._secrets[1], host)

    if (!tokenMatch || this._loopback) {
      // not an echo
      this._parsePeers(id, data, host)
    }

    if (!this._listening) {
      return
    }

    // We are in server mode now. Add the record to the cache

    if (!tokenMatch) {
      // check if old token matches
      if (data.token !== hash(this._secrets[0], host)) {
        debug('Invalid token in TXT answer, discarding')
        return
      }
    }

    if (PORT.test(data.announce)) {
      var announce = Number(data.announce) || port
      debug('Announce received via TXT', id, host + ':' + announce)
      this.emit('peer', id, {port: announce, host: host})
      if (this._domainStore.add(id, announce, host) && socket) {
        this._push(id, announce, host, socket)
      }
    }

    if (PORT.test(data.unannounce)) {
      var unannounce = Number(data.unannounce) || port
      this._domainStore.remove(id, unannounce, host)
      debug('Un-announce received via TXT', id, host + ':' + unannounce)
    }

    if (data.subscribe) {
      debug('Subscribe-to-push received via TXT', id, host + ':' + port)
      this._pushStore.add(id, port, host)
    } else {
      debug('Unsubscribe-from-push received via TXT', id, host + ':' + port)
      this._pushStore.remove(id, port, host)
    }
  }
}

DNSDiscovery.prototype._push = function (id, port, host, socket) {
  var subs = this._pushStore.get(id, 16)
  var query = {
    additionals: [{
      type: 'SRV',
      name: id + '.' + this._domain,
      ttl: this._ttl,
      data: {
        port: port,
        target: host
      }
    }]
  }

  if (subs.length) debug('Pushing announcement to', subs.length, 'subscribers')
  for (var i = 0; i < subs.length; i++) {
    var peer = subs[i]
    var tid = socket.query(query, peer.port, peer.host)
    socket.setRetries(tid, 2)
  }
}

DNSDiscovery.prototype._onquestion = function (query, port, host, answers, multicast) {
  var domain = parseDomain(query.name)

  if (domain !== this._domain) return

  if (query.type === 'TXT' && domain === query.name) {
    debug('Replying state-info via TXT to %s:%s', host, port)
    answers.push({
      type: 'TXT',
      name: query.name,
      ttl: this._ttl,
      data: encodeTxt({
        token: hash(this._secrets[1], host),
        host: host,
        port: '' + port
      })
    })
    return
  }

  var id = parseId(query.name, domain)
  if (!id) {
    debug('Invalid ID in question, discarding', { name: query.name, domain: domain, host: host, port: port })
    return
  }

  if (query.type === 'TXT') {
    var buf = toBuffer(this._domainStore.get(id, 100))
    var token = hash(this._secrets[1], host)
    if (multicast && !buf.length) return // just an optimization
    debug('Replying known peers via TXT to', host + ':' + port)
    answers.push({
      type: 'TXT',
      name: query.name,
      ttl: this._ttl,
      data: encodeTxt(buf.length ? {
        token: token,
        peers: buf.toString('base64')
      } : {
        token: token
      })
    })
    return
  }

  var peers = this._domainStore.get(id, 10)
  debug('Replying announce via', query.type, ' to', host + ':' + port)

  for (var i = 0; i < peers.length; i++) {
    var peer = peers[i]

    if (query.type === 'A') {
      answers.push({
        type: 'A',
        name: query.name,
        ttl: this._ttl,
        data: peer.host === '0.0.0.0' ? network() : peer.host
      })
    }
    if (query.type === 'SRV') {
      answers.push({
        type: 'SRV',
        name: query.name,
        ttl: this._ttl,
        data: {
          port: peer.port,
          target: peer.host
        }
      })
    }
  }
}

DNSDiscovery.prototype._onquery = function (query, port, host, socket) {
  var reply = {questions: query.questions, answers: []}
  var i = 0

  for (i = 0; i < query.questions.length; i++) {
    this._onquestion(query.questions[i], port, host, reply.answers)
  }
  for (i = 0; i < query.answers.length; i++) {
    this._onanswer(query.answers[i], port, host, socket)
  }
  for (i = 0; i < query.additionals.length; i++) {
    this._onanswer(query.additionals[i], port, host, socket)
  }
  socket.response(query, reply, port, host)
  // note: emit 'traffic' after calling .response() because socket.response() modifies `reply`
  this.emit('traffic', 'out:response', {message: reply, peer: {port: port, host: host}})
}

DNSDiscovery.prototype._probeAndSend = function (type, i, id, port, cb) {
  var self = this
  this._probe(i, 0, function (err) {
    if (err) return cb(err)
    self._send(type, i, id, port, cb)
  })
}

DNSDiscovery.prototype._send = function (type, i, id, port, cb) {
  var s = this.servers[i]
  var token = this._tokens[i]
  var data = null

  switch (type) {
    case TYPE_LOOKUP:
      data = {subscribe: true, token: token}
      break

    case TYPE_ANNOUNCE:
      data = {subscribe: true, token: token, announce: '' + port}
      break

    case TYPE_UNANNOUNCE:
      data = {token: token, unannounce: '' + port}
      break
  }

  var query = {
    index: i,
    questions: [{
      type: 'TXT',
      name: id + '.' + this._domain
    }],
    additionals: [{
      type: 'TXT',
      name: id + '.' + this._domain,
      ttl: this._ttl,
      data: encodeTxt(data)
    }]
  }

  this.socket.query(query, s.port, s.host, cb)
  this.emit('traffic', 'out:query', {message: query, peer: s})
}

DNSDiscovery.prototype.lookup = function (id, opts, cb) {
  debug('lookup()', id)
  this._visit(TYPE_LOOKUP, id, 0, opts, cb)
}

DNSDiscovery.prototype.announce = function (id, port, opts, cb) {
  debug('announce()', id)
  this._visit(TYPE_ANNOUNCE, id, port, opts, cb)
}

DNSDiscovery.prototype.unannounce = function (id, port, opts, cb) {
  debug('unannounce()', id)
  this._visit(TYPE_UNANNOUNCE, id, port, opts, cb)
}

DNSDiscovery.prototype._visit = function (type, id, port, opts, cb) {
  if (typeof opts === 'function') return this._visit(type, id, port, null, opts)
  if (typeof port === 'function') return this._visit(type, id, 0, port)
  if (!cb) cb = noop
  if (Buffer.isBuffer(id)) id = id.toString('hex')
  if (!opts) opts = {}

  var self = this
  var missing = this.servers.length
  var success = false

  if (opts.server !== false) {
    var publicPort = opts.publicPort || (opts.impliedPort ? 0 : port)
    for (var i = 0; i < this.servers.length; i++) {
      if (this._tokens[i]) this._send(type, i, id, publicPort, done)
      else this._probeAndSend(type, i, id, publicPort, done)
    }
  }

  if (type === TYPE_ANNOUNCE) this._domainStore.add(id, port, '0.0.0.0')
  if (type === TYPE_UNANNOUNCE) this._domainStore.remove(id, port, '0.0.0.0')

  if (opts.multicast !== false && this.multicast) {
    if (type !== TYPE_UNANNOUNCE) {
      missing++
      var message = {
        questions: [{
          type: 'TXT',
          name: id + '.' + this._domain
        }]
      }
      this.multicast.query(message, done)
      this.emit('traffic', 'out:multicastquery', {message: message})
    }
  }

  if (!missing) {
    missing++
    process.nextTick(done)
  }

  function done (_, res, q, _port, _host) {
    if (res) {
      success = true
      self.emit('traffic', 'in:response', {message: res, peer: {host: _host, port: _port}})
      try {
        var data = res.answers.length && decodeTxt(res.answers[0].data)
      } catch (err) {
        // do nothing
      }
      if (data) self._parseData(id, data, q.index, _host)
      if (type === TYPE_ANNOUNCE) self.emit('announced', id, {port: port})
      if (type === TYPE_UNANNOUNCE) self.emit('unannounced', id, {port: port})
    }

    if (!--missing) cb(success ? null : new Error('Query failed'))
  }
}

DNSDiscovery.prototype._parsePeers = function (id, data, host) {
  try {
    var buf = Buffer.from(data.peers, 'base64')
  } catch (err) {
    return
  }

  for (var i = 0; i < buf.length; i += 6) {
    var peer = decodePeer(buf, i)
    if (!peer) continue
    if (peer.host === '0.0.0.0') peer.host = host
    this.emit('peer', id, peer)
  }
}

DNSDiscovery.prototype._parseData = function (id, data, index, host) {
  if (data.token) {
    this._tokens[index] = data.token
    this._tokensAge[index] = this._tick
  }
  if (data && data.peers && id) this._parsePeers(id, data, host)
}

DNSDiscovery.prototype.whoami = function (cb) {
  var missing = this.servers.length
  var prevData = null
  var prevHost = null
  var called = false

  if (this.servers.length) {
    for (var i = 0; i < this.servers.length; i++) this._probe(i, 2, done)
  } else {
    debug('whoami() failed - no servers to ping')
    missing = 1
    process.nextTick(done)
  }

  function done (_, data, port, host) {
    if (data) {
      if (!called && IPv4.test(data.host) && PORT.test(data.port)) {
        if (prevHost && prevHost !== host) {
          called = true
          if (prevData.host === data.host && prevData.port === data.port) {
            cb(null, {port: Number(data.port), host: data.host})
          } else if (prevData.host === data.host) {
            cb(null, {port: 0, host: data.host})
          } else {
            cb(new Error('Inconsistent remote port/host'))
          }
        }
        prevData = data
        prevHost = host
      }
    }

    if (--missing || called) {
      if (!called) {
        debug('whoami() probe got response; waiting for a confirmation from %d other(s)', missing)
      }
      return
    }
    if (data) cb(null, {port: 0, host: data.host})
    else cb(new Error('Probe failed'))
  }
}

DNSDiscovery.prototype._probe = function (i, retries, cb) {
  var self = this
  var s = this.servers[i]
  var q = {
    questions: [{
      type: 'TXT',
      name: this._domain
    }]
  }
  debug('probing %s:%d', s.host, s.port)

  var first = true
  var result = null
  var id = this.socket.query(q, s.port, s.host, done)

  if (retries) this.socket.setRetries(id, retries)

  function done (_, res, query, port, host) {
    if (res) {
      self.emit('traffic', 'in:response', {message: res, peer: {host: host, port: port}})
      try {
        var data = res.answers.length && decodeTxt(res.answers[0].data)
      } catch (err) {
        // do nothing
      }
      if (data && data.token) {
        self._parseData(null, data, i, host)
        result = data
      }
    }

    if (result) {
      if (!first) {
        s.port = port
        s.secondaryPort = 0
      } else {
        s.secondaryPort = 0
      }

      debug('probe of %s:%d succeeded', host, port)
      return cb(null, result, port, host)
    }

    if (!first || !s.secondaryPort) {
      debug('probe of %s:%d failed', host, port)
      return cb(new Error('Probe failed'))
    }

    first = false
    debug('retrying probe of %s at secondary port %d', host, s.secondaryPort)
    id = self.socket.query(q, s.secondaryPort, s.host, done)
    if (retries) self.socket.setRetries(id, retries)
  }
}

DNSDiscovery.prototype.destroy = function (onclose) {
  debug('destroy()')
  if (onclose) this.once('close', onclose)

  var self = this
  var missing = this._sockets.length
  clearInterval(this._interval)

  if (this.multicast) this.multicast.destroy(onmulticastclose)
  else onmulticastclose()

  function onmulticastclose () {
    for (var i = 0; i < self._sockets.length; i++) {
      self._sockets[i].destroy(onsocketclose)
    }
  }

  function onsocketclose () {
    if (!--missing) self.emit('close')
  }
}

DNSDiscovery.prototype.listen = function (ports, onlistening) {
  if (onlistening) this.once('listening', onlistening)
  if (this._listening) throw new Error('Server is already listening')
  this._listening = true

  if (!ports) ports = [53, 5300]
  if (!Array.isArray(ports)) ports = [ports]

  debug('Listening on port(s)', ports.join(', '))

  var self = this
  var missing = ports.length

  for (var i = 0; i < ports.length; i++) {
    var socket = dns()
    socket.bind(ports[i], onbind)
    this._onsocket(socket)
  }

  function onbind () {
    if (!--missing) self.emit('listening')
  }
}

function noop () {}

function parseAddr (addr) {
  if (addr.indexOf(':') === -1) addr += ':5300,53'
  var match = addr.match(/^([^:]+)(?::(\d{1,5})(?:,(\d{1,5}))?)?$/)
  if (!match) throw new Error('Could not parse ' + addr)

  return {
    port: Number(match[2] || 53),
    secondaryPort: Number(match[3] || 0),
    host: match[1]
  }
}

function hash (secret, host) {
  return crypto.createHash('sha256').update(secret).update(host).digest('base64')
}

function parseId (name, domain) {
  if (!domain || name.length === domain.length) return null
  return name.slice(0, -domain.length - 1)
}

function parseDomain (name) {
  var i = name.lastIndexOf('.')
  if (i === -1) return null
  i = name.lastIndexOf('.', i - 1)
  return i === -1 ? name : name.slice(i + 1)
}

function toBuffer (peers) {
  var buf = Buffer.alloc(peers.length * 6)
  for (var i = 0; i < peers.length; i++) {
    if (!peers[i].buffer) peers[i].buffer = encodePeer(peers[i])
    peers[i].buffer.copy(buf, i * 6)
  }
  return buf
}

function encodePeer (peer) {
  var buf = Buffer.alloc(6)
  var parts = peer.host.split('.')
  buf[0] = Number(parts[0] || 0)
  buf[1] = Number(parts[1] || 0)
  buf[2] = Number(parts[2] || 0)
  buf[3] = Number(parts[3] || 0)
  buf.writeUInt16BE(peer.port || 0, 4)
  return buf
}

function decodePeer (buf, offset) {
  if (buf.length - offset < 6) return null
  var host = buf[offset++] + '.' + buf[offset++] + '.' + buf[offset++] + '.' + buf[offset++]
  var port = buf.readUInt16BE(offset)
  offset += 2
  return {port: port, host: host}
}

function decodeTxt (bufs) {
  var data = {}

  for (var i = 0; i < bufs.length; i++) {
    var buf = bufs[i]
    var j = buf.indexOf(61) // '='
    if (j === -1) data[buf.toString()] = true
    else data[buf.slice(0, j).toString()] = buf.slice(j + 1).toString()
  }

  return data
}

function encodeTxt (data) {
  var keys = Object.keys(data)
  var bufs = []

  for (var i = 0; i < keys.length; i++) {
    bufs.push(Buffer.from(keys[i] + '=' + data[keys[i]]))
  }

  return bufs
}

function isMulticaster (m) {
  return typeof m === 'object' && m && typeof m.query === 'function'
}
