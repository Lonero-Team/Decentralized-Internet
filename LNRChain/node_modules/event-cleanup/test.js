var EventEmitter = require('events')
var test = require('tape')
var wrap = require('./')

test('constructor', (t) => {
  t.test('fails if no argument provided', (t) => {
    t.throws(() => wrap())
    t.end()
  })

  var wrapper = wrap(new EventEmitter())
  t.ok(wrapper, 'got wrapper')
  t.ok(wrapper instanceof wrap, 'wrapper is correct type')
  t.end()
})

test('listeners', (t) => {
  t.test('on', (t) => {
    t.plan(3)
    var events = new EventEmitter()
    var wrapper = wrap(events)
    events.on('foo', () => t.pass('got event via EventEmitter'))
    wrapper.on('foo', () => t.pass('got event via EventWrapper'))
    events.emit('foo')
    wrapper.emit('foo')
  })

  t.test('removeListener', (t) => {
    t.plan(1)
    var events = new EventEmitter()
    var wrapper = wrap(events)
    var listener1 = () => {}
    var listener2 = () => t.pass('listener still registered')
    events.on('foo', listener1)
    wrapper.on('foo', listener2)
    events.removeListener('foo', listener1)
    events.emit('foo')
    wrapper.removeListener('foo', listener2)
    events.emit('foo')
    wrapper.emit('foo')
  })

  t.test('once', (t) => {
    t.plan(1)
    var events = new EventEmitter()
    var wrapper = wrap(events)
    wrapper.once('foo', () => t.pass('event emitted'))
    events.emit('foo')
    events.emit('foo')
  })

  t.test('removeAll', (t) => {
    t.plan(2)
    var events = new EventEmitter()
    var wrapper = wrap(events)
    events.on('foo', () => t.pass('listener still registered'))
    wrapper.on('foo', () => t.fail('listener should have been cleaned up'))
    wrapper.once('bar', () => {})
    wrapper.removeAll()
    events.emit('foo')
    t.equal(wrapper.listenerCount('bar'), 0, 'no more listeners')
  })

  t.end()
})
