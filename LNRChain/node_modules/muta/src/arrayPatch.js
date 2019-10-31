'use strict'

const SHIFT = Symbol('shift')
const POP = Symbol('pop')
const PUSH = Symbol('push')
const UNSHIFT = Symbol('unshift')

function arrayPatch (state) {
  return new Proxy(state, { get, set })
}

function get (target, key) {
  if (key in target) {
    return target[key]
  }

  if (isGrowOp(key)) {
    return ghostArray(target, key)
  }

  if (isShrinkOp(key)) {
    return 0
  }

  return Reflect.get(target, key)
}

function set (target, key, value) {
  if (isShrinkOp(key) && value === 0) {
    delete target[key]
    return true
  }
  return Reflect.set(target, key, value)
}

function isShrinkOp (key) {
  return key === POP || key === SHIFT
}
function isGrowOp (key) {
  return key === PUSH || key === UNSHIFT
}

function ghostArray (parent, parentKey) {
  let set = (target, key, value) => {
    let res = Reflect.set(target, key, value)
    let empty = target.length === 0
    let arrayIsSet = parentKey in parent
    if (!empty && !arrayIsSet) {
      parent[parentKey] = array
    } else if (empty && arrayIsSet) {
      delete parent[parentKey]
    }
    return res
  }
  let array = new Proxy([], { set })
  return array
}

module.exports = arrayPatch
Object.assign(module.exports, {
  PUSH,
  POP,
  UNSHIFT,
  SHIFT
})
