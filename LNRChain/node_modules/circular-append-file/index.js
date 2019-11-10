const fs = require('fs')
const MultiStream = require('multistream')

const DEFAULT_MAX_SIZE = 1024 /*1kb*/ * 1024 /*1mb*/ * 32 /*32mb*/

module.exports = function (targetPath, {maxSize} = {}) {
  maxSize = maxSize || DEFAULT_MAX_SIZE

  var fd = fs.openSync(targetPath, 'w')
  var position = 0
  var hasCircled = false

  const append = (data, cb) => {
    cb = cb || noop
    let offset = position
    fs.write(fd, data, offset, cb)
    position += data.length
    if (position > maxSize) {
      hasCircled = true
      position = 0
    }
  }

  const close = () => fs.close(fd)

  const createReadStream = () => {
    if (!hasCircled) {
      return fs.createReadStream(targetPath, {encoding: 'utf8'})
    } else {
      return MultiStream([
        fs.createReadStream(targetPath, {encoding: 'utf8', start: position}),
        fs.createReadStream(targetPath, {encoding: 'utf8', start: 0, end: position-1})
      ], {encoding: 'utf8'})
    }
  }

  return {append, createReadStream, close}
}

function noop () {}