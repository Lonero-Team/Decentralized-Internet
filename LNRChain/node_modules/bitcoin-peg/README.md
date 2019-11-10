# bitcoin-peg
*Cosmos Bitcoin peg zone module for [Lotion](https://github.com/keppel/lotion) and [coins](https://github.com/mappum/coins)*

**This module is currently under active development but works as a fully-functional prototype on top of Bitcoin testnet.**

This module implements a simplified version of the ["Proof-of-Stake Bitcoin Sidechains"](./bitcoinPeg.md) design. It works by holding Bitcoin in a special script which is a multisig spendable by consensus of the validators of a Tendermint blockchain.

This module can be dropped in to any [Lotion](https://github.com/nomic-io/lotion) app to enable the chain to hold reserves of Bitcoin, accept deposits, or pay out withdrawals in a low-trust manner. In addition, it lets the chain timestamp itself on the Bitcoin blockchain, increasing security of the chain by utilizing Bitcoin's proof-of-work.

## Usage
`npm install bitcoin-peg`

```js
let app = lotion()

// create a token using `coins` to be pegged to Bitcoin
app.use('pbtc', coins({
  handlers: {
    bitcoin: bitcoin.coinsHandler('bitcoin')
  }
}))

// pick a Bitcoin (or testnet) block header to use as the checkpoint
let checkpoint = {
  version: 1073733632,
  prevHash: Buffer.from('0000000000000113d4262419a8aa3a4fe928c0ea81893a2d2ffee5258b2085d8', 'hex').reverse(),
  merkleRoot: Buffer.from('baa3bb3f4fb663bf6974831ff3d2c37479f471f1558447dfae92f146539f7d9f', 'hex').reverse(),
  timestamp: 1544602833,
  bits: 0x1a015269,
  nonce: 3714016562,
  height: 1447488
}

// keep track of the Bitcoin blockchain, and specify the route of the pegged token
app.use('bitcoin', bitcoin(checkpoint, 'pbtc'))

app.start()
  .then((res) => console.log(res))
```
