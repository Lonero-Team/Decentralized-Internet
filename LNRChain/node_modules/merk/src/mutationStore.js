let old = require('old')
let { stringify } = require('deterministic-json')
let {
  access,
  symbols,
  baseObject,
  isObject,
  keyToPath,
  pathToKey
} = require('./common.js')

class MutationStore {
  constructor () {
    this.reset()
  }

  reset () {
    this.before = {}
    this.after = {}
  }

  keyIsNew (key) {
    return this.before[key] === symbols.delete
  }

  ancestor (path) {
    for (let i = 1; i < path.length; i++) {
      let ancestorKey = pathToKey(path.slice(0, -i))
      if (ancestorKey in this.before) {
        return this.before[ancestorKey]
      }
    }
  }

  mutate ({ op, path, oldValue, newValue, existed }) {
    let key = pathToKey(path)

    // if first change for this key, record previous state
    if (!(key in this.before)) {
      let value = oldValue
      if (!existed) value = symbols.delete

      // don't record if parent was previously non-existent
      if (this.ancestor(path) !== symbols.delete) {
        this.before[key] = baseObject(value)
      }
    }

    // store updated value for key
    if (op === 'put') {
      this.after[key] = newValue
    } else if (op === 'del') {
      let parentWasDeleted = this.ancestor(path) === symbols.delete
      if (this.keyIsNew(key) || parentWasDeleted) {
        delete this.before[key]
        delete this.after[key]
      } else {
        this.after[key] = symbols.delete
      }
    }
  }

  rollback (state) {
    // reapply previous values
    let beforeKeys = Object.keys(this.before)
    beforeKeys.sort()
    for (let key of beforeKeys) {
      let value = this.before[key]
      let path = keyToPath(key)

      // assign old value to parent object
      let [ parent ] = access(state, path.slice(0, -1))
      let lastKey = path[path.length - 1]
      if (value === symbols.delete) {
        delete parent[lastKey]
      } else {
        let base = parent[lastKey]
        // handle restoring a deleted array child-object
        if (Array.isArray(parent) && base == null) {
          parent[lastKey] = value
        } else {
          updateBase(base, value)
        }
      }
    }

    // special case for properties of root object
    if (this.before[symbols.root]) {
      let value = this.before[symbols.root]
      updateBase(state, value)
    }

    this.reset()
  }

  async commit (db) {
    let mutationKeys = Object.keys(this.after)
    if (this.after[symbols.root]) {
      // root symbol is a special case since Symbols
      // aren't included in Object.keys
      mutationKeys.push(symbols.root)
    }

    let batch = await db.batch()
    for (let key of mutationKeys) {
      let prefixedKey = '.'
      if (key !== symbols.root) prefixedKey += key

      let value = this.after[key]
      if (value === symbols.delete) {
        await batch.del(prefixedKey)
      } else {
        let json = stringify(value)
        await batch.put(prefixedKey, json)
      }
    }

    await batch.write()

    this.reset()
  }
}

function updateBase (base, updated) {
  Object.assign(base, updated)
  for (let key in base) {
    if (!(key in updated) && !isObject(base[key])) {
      delete base[key]
    }
  }
}

module.exports = old(MutationStore)
