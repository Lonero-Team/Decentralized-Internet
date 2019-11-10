let test = require('tape')
let proxmise = require('.')

test('must have getter', (t) => {
  try {
    proxmise()
    t.fail('should have thrown')
  } catch (err) {
    t.equals(err.message, 'Must specify a "get" handler')
  }
  t.end()
})

test('sync getter resolve', (t) => {
  let getterCallCount = 0
  let p = proxmise((path, resolve) => {
    getterCallCount++
    resolve(path)
  })

  t.test('access path', (t) => {
    let promise = p.foo.bar
    promise.then((path) => {
      t.deepEqual(path, [ 'foo', 'bar' ])
      t.equal(getterCallCount, 1)
      t.end()
    })
  })

  t.test('access "then"/"catch" objects', (t) => {
    let promise = p.then.catch.abc
    promise.then((path) => {
      t.deepEqual(path, [ 'then', 'catch', 'abc' ])
      t.equal(getterCallCount, 2)
      t.end()
    })
  })

  t.test('access root', (t) => {
    let promise = p
    promise.then((path) => {
      t.deepEqual(path, [])
      t.equal(getterCallCount, 3)
      t.end()
    })
  })
})

test('sync getter reject', (t) => {
  let getterCallCount = 0
  let p = proxmise((path, resolve, reject) => {
    getterCallCount++
    reject(path)
  })

  t.test('access path', (t) => {
    let promise = p.foo.bar
    promise.catch((path) => {
      t.deepEqual(path, [ 'foo', 'bar' ])
      t.equal(getterCallCount, 1)
      t.end()
    })
  })

  t.test('access root', (t) => {
    let promise = p
    promise.then(() => {
      t.fail('should not have resolved')
    }).catch((path) => {
      t.deepEqual(path, [])
      t.equal(getterCallCount, 2)
      t.end()
    })
  })
})

test('async getter resolve', (t) => {
  let getterCallCount = 0
  let p = proxmise(async (path) => {
    getterCallCount++
    return path
  })

  t.test('access path', (t) => {
    let promise = p.foo.bar
    promise.then((path) => {
      t.deepEqual(path, [ 'foo', 'bar' ])
      t.equal(getterCallCount, 1)
      t.end()
    })
  })

  t.test('access root', (t) => {
    let promise = p
    promise.then((path) => {
      t.deepEqual(path, [])
      t.equal(getterCallCount, 2)
      t.end()
    })
  })
})

test('async getter reject', (t) => {
  let getterCallCount = 0
  let p = proxmise(async function (path) {
    getterCallCount++
    throw path
  })

  t.test('access path', (t) => {
    let promise = p.foo.bar
    promise.then(() => {
      t.fail('should not have resolved')
    }, (path) => {
      t.deepEqual(path, [ 'foo', 'bar' ])
      t.equal(getterCallCount, 1)
      t.end()
    })
  })

  t.test('access root', (t) => {
    let promise = p
    promise.catch((path) => {
      t.deepEqual(path, [])
      t.equal(getterCallCount, 2)
      t.end()
    })
  })
})

test('mutations should error', (t) => {
  let p = proxmise(() => {})

  t.test('set', (t) => {
    try {
      p.foo = 'bar'
      t.fail('should have thrown')
    } catch (err) {
      t.equal(err.message, 'This object is read-only')
      t.end()
    }
  })

  t.test('delete', (t) => {
    try {
      delete p.foo
      t.fail('should have thrown')
    } catch (err) {
      t.equal(err.message, 'This object is read-only')
      t.end()
    }
  })
})

test('mutations should error', (t) => {
  let p = proxmise(() => {})

  t.test('set', (t) => {
    try {
      p.foo = 'bar'
      t.fail('should have thrown')
    } catch (err) {
      t.equal(err.message, 'This object is read-only')
      t.end()
    }
  })

  t.test('delete', (t) => {
    try {
      delete p.foo
      t.fail('should have thrown')
    } catch (err) {
      t.equal(err.message, 'This object is read-only')
      t.end()
    }
  })
})

test('calls', (t) => {
  t.test('calls error when no call handler is specified', (t) => {
    let p = proxmise(() => {})
    try {
      p.foo()
      t.fail('should have thrown')
    } catch (err) {
      t.equal(err.message, 'Cannot call property')
      t.end()
    }
  })

  t.test('call', (t) => {
    t.plan(2)
    let p = proxmise(
      () => {},
      (path, ...args) => {
        t.deepEqual(path, [ 'foo', 'bar' ])
        t.deepEqual(args, [ 1, 2, 3 ])
      }
    )
    p.foo.bar(1, 2, 3)
  })
})
