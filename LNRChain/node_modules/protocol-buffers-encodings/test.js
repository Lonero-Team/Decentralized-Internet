var tape = require('tape')
var encodings = require('./')

tape('name', function (t) {
  t.same(encodings.name(encodings.varint), 'varint')
  t.same(encodings.name(encodings.float), 'float')
  t.end()
})

tape('varint', function (t) {
  test(t, encodings.varint, [42, 10, 0, 999999])
})

tape('string', function (t) {
  test(t, encodings.string, ['a', 'abefest', 'øøø'])
})

tape('bytes', function (t) {
  test(t, encodings.bytes, [Buffer.alloc(4096), Buffer.from('hi')])
})

tape('bool', function (t) {
  test(t, encodings.bool, [true, false])
})

tape('int32', function (t) {
  test(t, encodings.int32, [-1, 0, 42, 4242424])
})

tape('int64', function (t) {
  test(t, encodings.int64, [-1, 0, 1, 24242424244])
})

tape('sint64', function (t) {
  test(t, encodings.sint64, [-14, 0, 144, 4203595524])
})

tape('uint64', function (t) {
  test(t, encodings.uint64, [1, 0, 144, 424444, 4203595524])
})

tape('fixed64', function (t) {
  test(t, encodings.fixed64, [Buffer.from([0, 0, 0, 0, 0, 0, 0, 1])])
})

tape('double', function (t) {
  test(t, encodings.double, [0, 2, 0.5, 0.4])
})

tape('float', function (t) {
  test(t, encodings.float, [0, 2, 0.5])
})

tape('fixed32', function (t) {
  test(t, encodings.fixed32, [4, 0, 10000])
})

tape('sfixed32', function (t) {
  test(t, encodings.sfixed32, [-100, 4, 0, 142425])
})

function test (t, enc, vals) {
  if (!Array.isArray(vals)) vals = [vals]

  for (var i = 0; i < vals.length; i++) {
    var val = vals[i]
    var buf = Buffer.alloc(enc.encodingLength(val))

    enc.encode(val, buf, 0)

    t.same(enc.encode.bytes, buf.length)
    t.same(enc.encodingLength(val), buf.length)
    t.same(enc.decode(buf, 0), val)
    t.same(enc.decode.bytes, buf.length)

    var anotherBuf = Buffer.alloc(enc.encodingLength(val) + 1000)

    buf = enc.encode(val, anotherBuf, 10)
    t.same(buf, anotherBuf)
    t.ok(enc.encode.bytes < anotherBuf.length)
    t.same(enc.decode(buf, 10, 10 + enc.encodingLength(val)), val)
    t.ok(enc.decode.bytes < anotherBuf.length)
  }

  t.end()
}
