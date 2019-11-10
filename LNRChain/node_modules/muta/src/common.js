'use strict'

function keyToIndex (key) {
  try {
    let index = parseInt(key, 10)
    if (index >= 0 && index.toString() === key) {
      return index
    }
  } catch (err) {}
  return key
}

module.exports = { keyToIndex }
