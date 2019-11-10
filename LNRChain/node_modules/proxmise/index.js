module.exports = function proxmise (get, call, path = []) {
  if (typeof get !== 'function') {
    throw Error('Must specify a "get" handler')
  }

  let { promise, resolve, reject } = createPromise()

  let lastProperty = path[path.length - 1]
  let isPromiseMethod =
    lastProperty === 'then' ||
    lastProperty === 'catch'

  // return proxied thennable function
  let target = function () {}
  return new Proxy(target, {
    get (target, key) {
      // recursively wrap props
      return proxmise(get, call, path.concat(key))
    },

    set () {
      throw Error('This object is read-only')
    },

    deleteProperty () {
      throw Error('This object is read-only')
    },

    apply (target, thisArg, args) {
      if (isPromiseMethod) {
        // run getter
        let res = get(path.slice(0, -1), resolve, reject)

        // if getter returned a Promise, hook it up to the
        // proxmise
        if (res instanceof Promise) {
          res.then(resolve, reject)
        }

        // call the actual Promise method (then/catch)
        // to attach the user's handler
        return promise[lastProperty](...args)
      }

      if (call == null) {
        throw Error('Cannot call property')
      }

      return call(path, ...args)
    }

    // TODO: handle other traps
  })
}

function createPromise () {
  // create Promise and pull out resolve/reject funcs
  let funcs
  let promise = new Promise((resolve, reject) => {
    funcs = { resolve, reject }
  })
  let { resolve, reject } = funcs
  return { promise, resolve, reject }
}
