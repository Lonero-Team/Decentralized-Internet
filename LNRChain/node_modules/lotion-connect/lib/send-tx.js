let { encode } = require('./tx-encoding.js')

function SendTx(lc) {
  return function(tx) {
    let nonce = Math.floor(Math.random() * (2 << 12))
    let txBytes = encode(tx, nonce).toString('base64')
    return lc.rpc.broadcastTxCommit({ tx: txBytes })
  }
}

module.exports = SendTx
