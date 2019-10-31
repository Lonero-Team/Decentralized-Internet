let decamelize = require('decamelize')

// coverts arbitrary options into CLI args
// { foo: 1, barBaz: 'x' } => [ '--foo=1', '--bar_baz=x' ]
// { nested: { x: 5 } } => [ '--nested.x=5' ]
module.exports = function flags (opts = {}, prefix = '') {
  let args = []
  for (let [ key, value ] of Object.entries(opts)) {
    key = decamelize(key)
    if (typeof value === 'object') {
      // recurse for objects
      let subArgs = flags(value, `${prefix}${key}.`)
      args.push(...subArgs)
    } else {
      // fooBar: 5 => '--foo_bar=5'
      let arg = `--${prefix}${key}=${value.toString()}`
      args.push(arg)
    }
  }
  return args
}
