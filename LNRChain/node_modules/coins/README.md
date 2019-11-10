# Coins

`coins` is a cryptocurrency middleware for [Lotion](https://github.com/keppel/lotion).

It gives you a fully-functional token out-of-the-box, but can also act as a framework for more complex functionality (e.g. smart contracts). ERC20 tokens are so 2017!

## Installation

`coins` requires __node v7.6.0__ or higher.

```bash
$ npm install coins
```

## Usage

### Basic coin usage

First, generate an address for yourself:
```bash
$ npx coins
Your Address:
338sjLktF4XzRfz25oyH11jVYhZMokbsr

Your wallet seed is stored at "~/.coins",
make sure to keep it secret!
```

Add the middleware to your lotion app, and be sure to give yourself some coins!

`app.js`
```js
let lotion = require('lotion')
let coins = require('coins')

let app = lotion({
  // lotion options
  devMode: true
})

app.use(coins({
  // coins options
  name: 'kittycoin',
  initialBalances: {
    'BD3EaPRLquuHx7DMcSQ2YX54frnSEZ3YD': 21000000
  }
}))

app.listen(3000).then(({ GCI }) => {
  console.log('App GCI:', GCI)
})
```

Then build a client:
`wallet.js`:
```js
let lotion = require('lotion')
let coins = require('coins')
let client = await lotion.connect(APP_GCI)
let wallet = coins.wallet(client)

// wallet methods:
let address = wallet.address()
console.log(address) // 'OGccsuLV2xuoDau1XRc6hc7uO24'

let balance = await wallet.balance()
console.log(balance) // 20

let result = await wallet.send('04oDVBPIYP8h5V1eC1PSc5JU6Vo', 5)
console.log(result) // { height: 42 }
```


### Writing your own advanced coin handler

`chain.js`:
```js
let coins = require('coins')
let lotion = require('lotion')

let app = lotion({})

app.use(coins({
    name: 'testcoin',
    initialBalances: {
      'judd': 10,
      'matt': 10
    },
    handlers: {
      'my-module': {
        onInput(input, tx, state) {
          // this function is called when coins of
          // this type are used as a transaction input.

          // if the provided input isn't valid, throw an error.
          if(isNotValid(input)) {
            throw Error('this input isn\'t valid!')
          }

          // if the input is valid, update the state to
          // reflect the coins having been spent.
          state[input.senderAddress] -= input.amount
        },

        onOutput(output, tx, state) {
          // here's where you handle coins of this type
          // being received as a tx output.

          // usually you'll just want to mutate the state
          // to increment the balance of some address.
          state[output.receiverAddress] = (state[output.receiverAddress] || 0) + output.amount
        }
      }
    }
  }
}))

app.listen(3000)
```

run `node chain.js`, then write
`client.js`:
```js
let lotion = require('lotion')
let client = await lotion.connect(YOUR_APP_GCI)

let result = await client.send({
  from: [
    // tx inputs. each must include an amount:
    { amount: 4, type: 'my-module', senderAddress: 'judd' }
  ],
  to: [
    // tx outputs. sum of amounts must equal sum of amounts of inputs.
    { amount: 4, type: 'my-module', receiverAddress: 'matt' }
  ]
})

console.log(result)
// { ok: true, height: 42 }

```
## License

MIT
