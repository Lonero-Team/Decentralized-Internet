let old = require('old')
let createTx = require('./transaction.js')
let _Node = require('./node.js')

class Tree {
  constructor (db) {
    if (!db || db.toString() !== 'LevelUP') {
      throw Error('Must specify a LevelUp interface')
    }
    this.db = db
    this._rootNode = null
    this.lock = null

    this.Node = _Node(this.db)

    this.initialized = false
    this.initialize = this.maybeLoad()
  }

  async batch () {
    let release = await this.acquireLock()
    return new Batch(this, release)
  }

  get (key) {
    return this.Node.get(key)
  }

  async maybeLoad () {
    try {
      let rootKey = (await this.db.get(':root')).toString()
      this._rootNode = await this.Node.get(rootKey)
    } catch (err) {
      if (!err.notFound) throw err
    }

    this.initialized = true
  }

  async rootNode () {
    await this.initialize
    return this._rootNode
  }

  rootHash () {
    if (this._rootNode == null) return null
    return this._rootNode.hash
  }

  async acquireLock () {
    while (true) {
      if (!this.lock) break
      await this.lock
    }

    let _resolve
    let releaseLock = () => {
      this.lock = null
      _resolve()
    }
    this.lock = new Promise((resolve) => {
      _resolve = resolve
    })

    return releaseLock
  }

  async getBranchRange (from, to) {
    await this.initialize
    let release = await this.acquireLock()
    let branch = this._rootNode.getBranchRange(from, to, this.db)
    release()
    return branch
  }
}

module.exports = old(Tree)

class Batch {
  constructor (tree, release) {
    this.tree = tree
    this.release = release
    this.tx = createTx(tree.db)
    this.rootNode = tree._rootNode
  }

  async setRoot (node) {
    if (node != null) {
      await this.tx.put(':root', node.key)
    } else {
      await this.tx.del(':root')
    }

    this.rootNode = node
  }

  async put (key, value) {
    let node = new this.tree.Node({ key, value, db: this.tree.db })

    // no root, set node as root
    if (this.rootNode == null) {
      await node.save(this.tx)
      await this.setRoot(node)
      return
    }

    let successor = await this.rootNode.put(node, this.tx)
    await this.setRoot(successor)
  }

  get (key) {
    return this.tree.Node.get(key, this.tx)
  }

  async del (key) {
    if (this.rootNode == null) {
      throw Error('Tree is empty')
    }

    let successor = await this.rootNode.delete(key, this.tx)
    await this.setRoot(successor)
  }

  write () {
    try {
      this.tree._rootNode = this.rootNode
      return this.tx.commit()
    } catch (err) {
      throw err
    } finally {
      this.release()
    }
  }
}
