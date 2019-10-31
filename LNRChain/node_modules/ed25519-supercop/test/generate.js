var test = require('tape')
var ed = require('../')

test('generate', function (t) {
  t.plan(3)
  var seed = ed.createSeed()
  t.equal(seed.length, 32)
  var kp = ed.createKeyPair(seed)
  t.equal(kp.publicKey.length, 32)
  t.equal(kp.secretKey.length, 64)
})
