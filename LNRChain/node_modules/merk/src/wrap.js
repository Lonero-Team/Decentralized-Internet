let { isObject, baseObject, access } = require('./common.js')

// wraps an object with a proxy, so we can keep track of mutations
function wrap (obj, onMutate, path = []) {
  function recordMutation (op, childPath, value) {
    let fullPath = path.concat(childPath)
    let oldValue
    let existed = false
    try {
      [ oldValue, existed ] = access(obj, childPath)
    } catch (err) {}
    let mutation = {
      op,
      path: fullPath,
      oldValue: baseObject(oldValue),
      newValue: value,
      existed
    }
    onMutate(mutation)
    // TODO: replace mutations for overriden paths
  }

  // TODO: wrap array methods to record array-specific mutations,
  // otherwise ops like splices and shifts will create N mutations

  function put (obj, key, value, path = []) {
    if (!isObject(value)) {
      // if we are overriding an existing object,
      // record deletion
      if (isObject(obj[key])) {
        // recursively delete object props
        del(obj, key)
      }

      // record parent object update
      let parent = baseObject(obj)
      parent[key] = baseObject(value)
      recordMutation('put', path, parent)
      return
    }

    // if we are overriding an existing non-object,
    // record update of parent base object
    if (key in obj && !isObject(obj[key])) {
      let base = baseObject(obj)
      delete base[key]
      recordMutation('put', path, base)
    }

    // if parent is array, ensure length gets updated
    if (Array.isArray(obj)) {
      let parent = baseObject(obj)
      recordMutation('put', path, parent)
    }

    let base = baseObject(value)
    recordMutation('put', path.concat(key), base)

    for (let childKey in value) {
      let child = value[childKey]

      // if any of our non-object children override an
      // existing object, then record deletion
      if (!isObject(child)) {
        if (!isObject(obj[key])) continue
        if (!isObject(obj[key][childKey])) continue
        del(obj[key], childKey, path.concat(key))
        continue
      }

      // recursively record puts for objects
      put(value, childKey, child, path.concat(key))
    }
  }

  function del (obj, key, path = []) {
    let value = obj[key]

    if (!isObject(obj[key])) {
      // record parent object update
      let parent = baseObject(obj)
      delete parent[key]
      recordMutation('put', path, parent)
      return
    }

    // recursively record deletions for objects
    for (let childKey in value) {
      let child = value[childKey]
      if (!isObject(child)) continue
      del(value, childKey, path.concat(key))
    }

    recordMutation('del', path.concat(key))
  }

  let wrapped = new Proxy(obj, {
    // recursively wrap child objects when accessed
    get (obj, key) {
      let value = obj[key]

      // functions should be bound to parent
      if (typeof value === 'function') {
        return value.bind(wrapped)
      }

      // don't recurse if not object
      if (!isObject(value)) {
        return value
      }

      // convert array bases to actual array
      if ('__MERK_ARRAY__' in value) {
        let base = value
        value = new Array(value.length)
        Object.assign(value, base)
        delete value.__MERK_ARRAY__
      }

      // if value is object, recursively wrap
      let childPath = path.concat(key)
      return wrap(value, onMutate, childPath)
    },

    // record mutations
    set (obj, key, value) {
      put(obj, key, value)
      obj[key] = value
      return true
    },

    // record deletions as mutations too
    deleteProperty (obj, key) {
      if (!(key in obj)) return true
      del(obj, key)
      delete obj[key]
      return true
    },

    // ovverride ownKeys to exclude symbol properties
    ownKeys () {
      return Object.getOwnPropertyNames(obj)
    }
  })
  return wrapped
}

module.exports = wrap
