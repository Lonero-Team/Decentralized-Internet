'use strict'

const VirtualObject = require('./virtualObject.js')
const { keyToIndex } = require('./common.js')
const arrayPatch = require('./arrayPatch.js')
const infiniteObject = require('./infiniteObject.js')
const {
  PUSH,
  POP,
  UNSHIFT,
  SHIFT
} = arrayPatch

// VirtualArray represents a wrapper around a target array,
// allowing virtual mutations including overriding elements,
// shrinking, and growing. Currently, splicing is not supported
// so growing and shrinking must happen at the ends (push, unshift, pop, shift).
class VirtualArray extends VirtualObject {
  constructor (target, patch = infiniteObject()) {
    patch = arrayPatch(patch)
    super(target, patch)
  }

  length () {
    let length = this.target.length
    length += this.patch[PUSH].length
    length += this.patch[UNSHIFT].length
    length -= this.patch[POP]
    length -= this.patch[SHIFT]
    return length
  }

  resolveIndex (index) {
    let { patch, target } = this

    let unshiftLen = patch[UNSHIFT].length
    if (index < unshiftLen) {
      return { index, array: patch[UNSHIFT] }
    }
    index -= unshiftLen
    index += patch[SHIFT]

    let targetLen = target.length - patch[POP]
    if (index < targetLen) {
      return { index, array: target }
    }

    index -= targetLen

    let pushLen = patch[PUSH].length
    if (index < pushLen) {
      return { index, array: patch[PUSH] }
    }
  }

  get (target, key) {
    if (key === 'length') {
      return this.length()
    }

    if (key === Symbol.iterator) {
      return this.iterator()
    }

    let index = keyToIndex(key)
    if (typeof index !== 'number') {
      if (key in methods) {
        return methods[key].bind(this)
      }
      return super.get(this.target, key)
    }

    let res = this.resolveIndex(index)
    if (res == null) return

    if (res.array === this.target) {
      return super.get(this.target, res.index)
    }

    return res.array[res.index]
  }

  set (target, key, value) {
    if (key === 'length') {
      return this.setLength(value)
    }

    let index = keyToIndex(key)
    if (typeof index !== 'number') {
      return super.set(this.target, key, value)
    }

    if (index >= this.length()) {
      this.setLength(index + 1)
    }

    let res = this.resolveIndex(index)

    if (res.array === this.target) {
      return super.set(this.target, res.index, value)
    }

    res.array[res.index] = value
    return true
  }

  deleteProperty (target, key) {
    let index = keyToIndex(key)
    if (typeof index !== 'number') {
      return super.deleteProperty(this.target, key)
    }

    let res = this.resolveIndex(index)
    if (res == null) {
      return true
    }

    if (res.array === this.target) {
      return super.deleteProperty(this.target, res.index)
    }

    delete res.array[res.index]
    return true
  }

  has (target, key) {
    let index = keyToIndex(key)
    if (typeof index !== 'number') {
      return super.has(this.target, key)
    }

    let res = this.resolveIndex(index)
    if (res == null) return false

    if (res.array === this.target) {
      return super.has(this.target, res.index)
    }
    return res.index in res.array
  }

  getOwnPropertyDescriptor (target, key) {
    if (!this.has(target, key)) return

    let index = keyToIndex(key)
    if (typeof index !== 'number') {
      return super.getOwnPropertyDescriptor(this.target, key)
    }

    let res = this.resolveIndex(index)

    if (res.array === this.target) {
      return super.getOwnPropertyDescriptor(this.target, res.index)
    }

    return {
      value: this.get(this.target, key),
      writable: true,
      enumerable: true,
      configurable: true
    }
  }

  ownKeys (target) {
    let keys = []
    for (let i = 0; i < this.length(); i++) {
      let key = String(i)
      if (this.has(target, key)) {
        keys.push(key)
      }
    }

    let objectKeys = super.ownKeys(this.target)
    for (let key of objectKeys) {
      let index = keyToIndex(key)
      if (typeof index === 'number') continue
      keys.push(key)
    }

    return keys
  }

  setLength (length) {
    if (!Number.isInteger(length) || length < 0) {
      throw RangeError('Invalid array length')
    }

    let { patch, target } = this
    let lengthChange = length - this.length()

    // noop
    if (lengthChange === 0) {
      return true
    }

    // increase length by setting on 'push' values
    // TODO: subtract from pop count if > 0 (and delete index?)
    if (lengthChange > 0) {
      patch[PUSH].length += lengthChange
      return true
    }

    // decrease length (lengthChange is < 0)
    lengthChange = -lengthChange

    // shorten or remove push array
    if (lengthChange <= patch[PUSH].length) {
      patch[PUSH].length -= lengthChange
      return true
    }
    lengthChange -= patch[PUSH].length
    patch[PUSH].length = 0

    // shorten target range via pop count
    let targetSliceLength = target.length - patch[POP] - patch[SHIFT]
    if (lengthChange <= targetSliceLength) {
      // target slice is long enough, now we're done
      patch[POP] += lengthChange
      return true
    } else {
      // pop all of target slice and continue
      patch[POP] += targetSliceLength
      lengthChange -= targetSliceLength
    }

    // shorten unshift array
    patch[UNSHIFT].length -= lengthChange
    return true
  }

  iterator () {
    let self = this
    return function * () {
      for (let i = 0; i < self.length(); i++) {
        yield self.get(null, i)
      }
    }
  }

  commit () {
    super.commit()

    let { patch, target } = this

    // remove shifted elements, add unshifted elements
    target.splice(
      0,
      patch[SHIFT],
      ...patch[UNSHIFT]
    )
    // remove popped elements, add pushed elements
    target.splice(
      target.length - patch[POP],
      patch[POP],
      ...patch[PUSH]
    )

    delete patch[PUSH]
    delete patch[UNSHIFT]
    delete patch[POP]
    delete patch[SHIFT]
  }
}

const methods = {
  pop () {
    let length = this.length()
    if (length === 0) return

    let { target } = this

    let res = this.resolveIndex(length - 1)
    if (res.array !== target) {
      return res.array.pop()
    }

    let value = this.get(target, length - 1)
    this.setLength(length - 1)
    return value
  },

  shift () {
    if (this.length() === 0) return

    let { patch, target } = this

    let res = this.resolveIndex(0)
    if (res.array !== target) {
      return res.array.shift()
    }

    let value = this.get(target, 0)
    patch[SHIFT] += 1
    return value
  },

  unshift (...args) {
    let { patch } = this
    while (patch[SHIFT] > 0 && args.length > 0) {
      patch[SHIFT] -= 1
      this.set(this.target, 0, args.pop())
    }
    if (args.length > 0) {
      return patch[UNSHIFT].unshift(...args)
    }
    return this.length()
  },

  push (...args) {
    let { patch, target } = this
    while (patch[POP] > 0 && args.length > 0) {
      patch[POP] -= 1
      this.set(target, this.length() - 1, args.shift())
    }
    if (args.length > 0) {
      return patch[PUSH].push(...args)
    }
    return this.length()
  },

  splice (index, removeCount, ...insert) {
    // equivalent to SHIFT/UNSHIFT
    if (index === 0) {
      let removed = this.wrapper.slice(0, removeCount)
      // TODO: do this in way less operations by possibly consuming range of UNSHIFT
      for (let i = 0; i < removeCount; i++) {
        this.wrapper.shift()
      }
      this.wrapper.unshift(...insert)
      return removed
    }

    // equivalent to POP/PUSH
    if (index === this.length() - removeCount) {
      let removed = this.wrapper.slice(this.length() - removeCount)
      // TODO: do this in way less operations by possibly consuming range of POP
      for (let i = 0; i < removeCount; i++) {
        this.wrapper.pop()
      }
      this.wrapper.push(...insert)
      return removed
    }

    throw Error('VirtualArray currently only supports slicing at the end of the array')
  }
}

module.exports = VirtualArray
Object.assign(VirtualArray, {
  PUSH,
  POP,
  UNSHIFT,
  SHIFT
})
