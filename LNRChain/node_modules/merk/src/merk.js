let wrap = require('./wrap.js')
let Tree = require('./tree.js')
let MutationStore = require('./mutationStore.js')
let load = require('./load.js')
let verify = require('./verify.js')
let createProof = require('./proof.js')
let { symbols } = require('./common.js')

async function createMerk (db) {
  if (!db || db.toString() !== 'LevelUP') {
    throw Error('Must provide a LevelUP instance')
  }

  // TODO: decouple state wrapper from tree
  // (could be used with any LevelUp)
  let tree = Tree(db)
  let mutations = MutationStore()

  let root = await load(tree)
  root[symbols.root] = () => root
  root[symbols.db] = () => tree
  root[symbols.mutations] = () => mutations

  let onMutate = (mutation) => mutations.mutate(mutation)
  return wrap(root, onMutate)
}

function assertRoot (root) {
  if (root[symbols.mutations] != null) return
  throw Error('Must specify a root merk object')
}

// revert to last commit
function rollback (root) {
  assertRoot(root)
  let mutations = root[symbols.mutations]()
  let unwrappedRoot = root[symbols.root]()
  mutations.rollback(unwrappedRoot)
}

// flush to db
function commit (root) {
  assertRoot(root)
  let mutations = root[symbols.mutations]()
  let db = root[symbols.db]()
  return mutations.commit(db)
}

// returns merkle root
function hash (root) {
  assertRoot(root)
  let tree = root[symbols.db]()
  return tree.rootHash().toString('hex')
}

// returns a merkle proof
function proof (root, query = '') {
  assertRoot(root)
  let tree = root[symbols.db]()
  return createProof(tree, query)
}

function getter (symbol) {
  return (root) => {
    assertRoot(root)
    return root[symbol]()
  }
}

module.exports = Object.assign(createMerk, {
  mutations: getter(symbols.mutations),
  rollback,
  commit,
  hash,
  proof,
  verify
})
