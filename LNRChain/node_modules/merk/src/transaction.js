let old = require('old')

let NULL = Symbol('null')

class Transaction {
  constructor (db) {
    this.db = db
    this.batch = db.batch()
    this.cache = {}
  }

  async get (key) {
    if (this.cache[key] != null) {
      if (this.cache[key] === NULL) {
        return null
      }
      return this.cache[key]
    }
    return this.db.get(key)
  }

  async put (key, value) {
    this.cache[key] = value
    this.batch.put(key, value)
  }

  async del (key) {
    this.cache[key] = NULL
    this.batch.del(key)
  }

  commit () {
    return this.batch.write()
  }
}

module.exports = old(Transaction)
