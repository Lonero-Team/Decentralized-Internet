module.exports = async function createProof (tree, query) {
  // range is query path, and all its child objects
  let from = '.' + query
  let to = '.' + query + '/' // 1 value past `query + '.'`

  // special case for root object (get all values)
  if (query === '') to = '/'

  // check if there is a match for this query
  try {
    await tree.get(from)
  } catch (err) {
    if (!err.notFound) throw err

    // if not, query parent object
    let path = query.split('.')
    query = path.slice(0, -1).join('.')
    from = '.' + query
    to = '.' + query + '.'

    // special case for root object (get all values)
    if (query === '') to = '/'
  }

  return tree.getBranchRange(from, to)
}
