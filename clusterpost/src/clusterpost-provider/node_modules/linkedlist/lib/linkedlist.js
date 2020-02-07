module.exports = function () {
  Object.defineProperty(this, '_head', {
    value: undefined,
    writable: true,
    enumerable: false,
    configurable: false
  })
  Object.defineProperty(this, '_tail', {
    value: undefined,
    writable: true,
    enumerable: false,
    configurable: false
  })
  Object.defineProperty(this, '_next', {
    value: undefined,
    writable: true,
    enumerable: false,
    configurable: false
  })
  Object.defineProperty(this, '_length', {
    value: 0,
    writable: true,
    enumerable: false,
    configurable: false
  })
}

module.exports.prototype.__defineGetter__('head', function () {
  return this._head && this._head.data
})

module.exports.prototype.__defineGetter__('tail', function () {
  return this._tail && this._tail.data
})

module.exports.prototype.__defineGetter__('current', function () {
  return this._current && this._current.data
})

module.exports.prototype.__defineGetter__('length', function () {
  return this._length
})

module.exports.prototype.push = function (data) {
  this._tail = new Item(data, this._tail)
  if (this._length === 0) {
    this._head = this._tail
    this._current = this._head
    this._next = this._head
  }
  this._length++
}

module.exports.prototype.pop = function () {
  var tail = this._tail
  if (this._length === 0) {
    return
  }
  this._length--
  if (this._length === 0) {
    this._head = this._tail = this._current = this._next = undefined
    return tail.data
  }
  this._tail = tail.prev
  this._tail.next = undefined
  if (this._current === tail) {
    this._current = this._tail
    this._next = undefined
  }
  return tail.data
}

module.exports.prototype.shift = function () {
  var head = this._head
  if (this._length === 0)  {
    return
  }
  this._length--
  if (this._length === 0) {
    this._head = this._tail = this._current = this._next = undefined
    return head.data
  }
  this._head = this._head.next
  if (this._current === head) {
    this._current = this._head
    this._next = this._current.next
  }
  return head.data
}

module.exports.prototype.unshift = function (data) {
  this._head = new Item(data, undefined, this._head)
  if (this._length === 0)  {
    this._tail = this._head
    this._next = this._head
  }
  this._length++
}

module.exports.prototype.unshiftCurrent = function () {
  var current = this._current
  if (current === this._head || this._length < 2) {
    return current && current.data
  }
  // remove
  if (current === this._tail) {
    this._tail = current.prev
    this._tail.next = undefined
    this._current = this._tail
  } else {
    current.next.prev = current.prev
    current.prev.next = current.next
    this._current = current.prev
  }
  this._next = this._current.next
  // unshift
  current.next = this._head
  current.prev = undefined
  this._head.prev = current
  this._head = current
  return current.data
}

module.exports.prototype.removeCurrent = function (data) {
  var current = this._current
  if (this._length === 0) {
    return
  }
  this._length--
  if (this._length === 0) {
    this._head = this._tail = this._current = this._next = undefined
    return current.data
  }
  if (current === this._tail) {
    this._tail = current.prev
    this._tail.next = undefined
    this._current = this._tail
  } else if (current === this._head) {
    this._head = current.next
    this._head.prev = undefined
    this._current = this._head
  } else {
    current.next.prev = current.prev
    current.prev.next = current.next
    this._current = current.prev
  }
  this._next = this._current.next
  return current.data
}

module.exports.prototype.next = function () {
  var next = this._next
  if (next !== undefined) {
    this._next = next.next
    this._current = next
    return next.data
  }
}

module.exports.prototype.resetCursor = function () {
  this._current = this._next = this._head
  return this
}

function Item (data, prev, next) {
  this.next = next
  if (next) next.prev = this
  this.prev = prev
  if (prev) prev.next = this
  this.data = data
}