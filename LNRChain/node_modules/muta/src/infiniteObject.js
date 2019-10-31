'use strict'

// all unset properties are resolved as a recursive
// infiniteObject. only recursive objects which have
// properties set on them will persist, e.g.:
//
// let obj = infiniteObject()
// obj.foo.bar.baz = 123
// // obj is { foo: { bar: { baz: 123 } } }
// delete obj.foo.bar.baz
// // obj is {}
function infiniteObject (parent, selfKey) {
  let state = {}
  let nKeys = 0

  let object = new Proxy(state, {
    get (target, key) {
      if (key in target) {
        return target[key]
      }

      return infiniteObject(object, key)
    },

    has (target, key) {
      return key in target
    },

    set (target, key, value) {
      if (parent != null && nKeys === 0) {
        parent[selfKey] = object
      }

      if (!(key in target)) {
        nKeys += 1
      }

      target[key] = value
      return true
    },

    deleteProperty (target, key) {
      if (!(key in target)) return true

      nKeys -= 1
      if (parent != null && nKeys === 0) {
        delete parent[selfKey]
      }

      delete target[key]
      return true
    }
  })

  return object
}

module.exports = infiniteObject
