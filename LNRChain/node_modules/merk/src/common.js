let createHash = require('create-hash')

const symbols = {
  mutations: Symbol('mutations'),
  db: Symbol('db'),
  delete: Symbol('delete'),
  root: Symbol('root')
}

function sha256 (data) {
  return createHash('sha256').update(data).digest()
}

function ripemd160 (data) {
  return createHash('ripemd160').update(data).digest()
}

function isObject (value) {
  return typeof value === 'object' && value != null && !Buffer.isBuffer(value)
}

// clones an object, without any properties of type 'object'
function baseObject (obj) {
  if (!isObject(obj)) return obj
  let base = {}
  if (Array.isArray(obj)) {
    // XXX
    base.__MERK_ARRAY__ = 1
    base.length = obj.length
  }
  for (let key in obj) {
    let value = obj[key]
    if (isObject(value)) continue
    base[key] = value
  }
  return base
}

// gets an object property based on an array key path
function access (obj, path) {
  if (path.length === 0) {
    return [ obj, true ]
  }

  let [ key, ...subpath ] = path
  if (!isObject(obj)) {
    throw Error(`Could not access property "${key}" of ${obj}`)
  }
  if (subpath.length === 0) {
    return [ obj[key], key in obj ]
  }
  return access(obj[key], subpath)
}

// shallow clone
function clone (value) {
  if (!isObject(value)) return value
  if (Array.isArray(value)) return value.slice()
  let cloned = {}
  // doesn't include symbols
  for (let key in value) {
    cloned[key] = value[key]
  }
  return cloned
}

function pathToKey (path) {
  if (path.length === 0) return symbols.root
  // TODO: support path components w/ "." character ('["foo.bar"]')
  return path.join('.')
}

function keyToPath (key) {
  if (key === symbols.root) return []
  // TODO: support path components w/ "." character ('["foo.bar"]')
  return key.split('.')
}

module.exports = {
  sha256,
  ripemd160,
  isObject,
  baseObject,
  access,
  clone,
  symbols,
  keyToPath,
  pathToKey
}
