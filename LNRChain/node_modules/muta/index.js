'use strict'

const VirtualObject = require('./src/virtualObject.js')
const { ASSIGN, DELETE } = VirtualObject
const VirtualArray = require('./src/virtualArray.js')
const { PUSH, POP, SHIFT, UNSHIFT } = VirtualArray

module.exports =
function muta (target) {
  let patch
  if (Array.isArray(target)) {
    patch = new VirtualArray(target)
  } else {
    patch = new VirtualObject(target)
  }
  return patch.wrapper
}

module.exports.commit =
function commit (wrapper) {
  let patch = unwrap(wrapper)
  patch.commit()
}

module.exports.patch =
module.exports.getPatch =
function patch (wrapper) {
  let patch = unwrap(wrapper)
  return patch.patch
}

Object.assign(module.exports, {
  ASSIGN,
  DELETE,
  PUSH,
  POP,
  SHIFT,
  UNSHIFT
})

function unwrap (wrapper) {
  let patch = wrapper[VirtualObject.PATCH]
  if (patch == null) {
    throw Error('Argument must be a muta wrapped object')
  }
  return patch
}
