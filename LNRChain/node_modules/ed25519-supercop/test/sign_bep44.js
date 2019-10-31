var test = require('tape')
var ed = require('../')

test('signing matches bep44', function (t) {
  t.plan(1)
  var pk = Buffer(
    '77ff84905a91936367c01360803104f92432fcd904a43511876df5cdf3e7e548',
    'hex'
  )
  var sk = Buffer(
    'e06d3183d14159228433ed599221b80bd0a5ce8352e4bdf0262f76786ef1c74d'
    + 'b7e7a9fea2c0eb269d61e3b38e450a22e754941ac78479d6c54e1faf6037881d',
    'hex'
  )
  var msg = Buffer('3:seqi1e1:v12:Hello World!')
  t.equal(
    ed.sign(msg, pk, sk).toString('hex'),
    '305ac8aeb6c9c151fa120f120ea2cfb923564e11552d06a5d856091e5e853cff'
    + '1260d3f39e4999684aa92eb73ffd136e6f4f3ecbfda0ce53a1608ecd7ae21f01'
  )
})

test('signing matches bep44 (hex)', function (t) {
  t.plan(1)
  var pk = '77ff84905a91936367c01360803104f92432fcd904a43511876df5cdf3e7e548'
  var sk = 'e06d3183d14159228433ed599221b80bd0a5ce8352e4bdf0262f76786ef1c74d'
    + 'b7e7a9fea2c0eb269d61e3b38e450a22e754941ac78479d6c54e1faf6037881d'
  var msg = '3:seqi1e1:v12:Hello World!'
  t.equal(
    ed.sign(msg, pk, sk).toString('hex'),
    '305ac8aeb6c9c151fa120f120ea2cfb923564e11552d06a5d856091e5e853cff'
    + '1260d3f39e4999684aa92eb73ffd136e6f4f3ecbfda0ce53a1608ecd7ae21f01'
  )
})
