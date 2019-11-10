var test = require('tape')
var ed = require('../')

test('sign and verify', function (t) {
  t.plan(4)
  var pk = '77ff84905a91936367c01360803104f92432fcd904a43511876df5cdf3e7e548'
  var sk = 'e06d3183d14159228433ed599221b80bd0a5ce8352e4bdf0262f76786ef1c74d'
    + 'b7e7a9fea2c0eb269d61e3b38e450a22e754941ac78479d6c54e1faf6037881d'
  var msg = 'whatever'
  var sig = ed.sign(msg, pk, sk)
  var xsig = xmod(sig)
  var xmsg = xmod(Buffer(msg))
  var xpk = xmod(Buffer(pk, 'hex'))
 
  t.ok(ed.verify(sig, msg, pk))
  t.notOk(ed.verify(xsig, msg, pk))
  t.notOk(ed.verify(sig, xmsg, pk))
  t.notOk(ed.verify(sig, msg, xpk))
})

function xmod (buf) {
  var cp = Buffer(buf)
  cp[0] = ~cp[0]
  return cp
}
