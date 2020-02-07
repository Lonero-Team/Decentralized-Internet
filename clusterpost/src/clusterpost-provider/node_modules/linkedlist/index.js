module.exports = process.env.LINKEDLIST_COV
   ? require('./lib-cov/linkedlist')
   : require('./lib/linkedlist')