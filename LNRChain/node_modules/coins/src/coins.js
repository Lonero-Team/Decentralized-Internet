let { burnHandler, normalizeTx, normalizeOutput } = require('./common.js')
let getSigHash = require('./sigHash.js')
let ed25519Account = require('./ed25519Account.js')
let secp256k1Account = require('./secp256k1Account.js')
let multisigAccount = require('./multisigAccount.js')
let accounts = require('./accounts.js')

const defaultHandlers = {
  accounts: accounts({
    // types of accounts
    ed25519: ed25519Account,
    secp256k1: secp256k1Account,
    multisig: multisigAccount
  })
}

function coins (opts = {}) {
  let { handlers, minFee } = opts

  // get handlers from `defaultHandlers`, and optionally add more or
  // override from `opts.handlers`
  handlers = Object.assign({}, defaultHandlers, handlers)

  // specify default fee handler if none given
  if (handlers.fee == null) {
    handlers.fee = burnHandler
  }

  if (minFee != null) {
    if (!Number.isSafeInteger(minFee) || minFee <= 0) {
      throw Error('Invalid minFee option')
    }
  }

  // accesses a method from a handler
  function getHandlerMethod (type, funcName) {
    // get handler object
    let handler = handlers[type]
    if (handler == null) {
      throw Error(`Unknown handler type: "${type}"`)
    }

    // get method from handler object
    let func = handler[funcName]
    if (func == null) {
      throw Error(`Handler "${type}" does not implement "${funcName}"`)
    }
    return func
  }

  let methods = {
    mint (state, output, context) {
      // set default properties
      normalizeOutput(output)

      // output format check
      putCheck(output)

      // run handler as if we are processing a tx with this output
      processOutput(output, state, context)
    },

    // removes balance from an account without validating any rules
    burn (state, address, amount) {
      if (amount < 0) {
        throw Error('Amount must be >= 0')
      }
      if (!Number.isInteger(amount)) {
        throw Error('Amount must be an integer')
      }
      if (!Number.isSafeInteger(amount)) {
        throw Error('Amount must be < 2^53')
      }

      let account = accounts.getAccount(state.accounts, address)
      if (account.balance < amount) {
        throw Error('Insufficient funds')
      }

      account.balance -= amount
    },

    getAccount (state, address) {
      return accounts.getAccount(state.accounts, address)
    }
  }

  function setContextProperties (state, context) {
    context = Object.assign({}, context)
    for (let key in methods) {
      context[key] = methods[key].bind(null, state)
    }
    return context
  }

  // runs an input
  function processInput (input, state, context) {
    let onInput = getHandlerMethod(input.type, 'onInput')
    let subState = state[input.type]
    onInput(input, subState, context)
  }

  // runs an output
  function processOutput (output, state, context) {
    let onOutput = getHandlerMethod(output.type, 'onOutput')
    let subState = state[output.type]
    onOutput(output, subState, context)
  }

  // run at chain genesis
  function initializer (state, context) {
    context = setContextProperties(state, context)

    // initialize handlers
    for (let handlerName in handlers) {
      let { initialState, initialize } = handlers[handlerName]
      state[handlerName] = initialState || {}
      if (initialize) {
        initialize(state[handlerName], context, opts)
      }
    }
  }

  // run every time there is a tx routed to this coin
  function txHandler (state, tx, context) {
    // ensure tx has to and from
    if (tx.from == null || tx.to == null) {
      // not a coins tx
      throw Error('Not a valid coins transaction, must have "to" and "from"')
    }

    context = setContextProperties(state, context)

    // convert tx to canonical format
    // (e.g. ensure `to` and `from` are arrays)
    normalizeTx(tx)
    let inputs = tx.from
    let outputs = tx.to
    if (inputs.length === 0) {
      throw Error('Must have at least 1 input')
    }

    // simple input/output checks (must have types and amounts)
    inputs.forEach(putCheck)
    outputs.forEach(putCheck)

    // make sure coin amounts in and out are equal
    let amountIn = sumAmounts(inputs)
    let amountOut = sumAmounts(outputs)
    if (amountIn !== amountOut) {
      throw Error('Sum of inputs and outputs must match')
    }

    // if minFee specified, last output must be type "fee"
    if (minFee > 0) {
      let lastOutput = outputs[outputs.length - 1]
      if (lastOutput.type !== 'fee') {
        throw Error('Must pay fee')
      }
      if (lastOutput.amount < minFee) {
        throw Error(`Must pay fee of at least ${minFee}`)
      }
    }

    // add properties to context
    // TODO: use a getter func (and cache the result)
    context.sigHash = getSigHash(tx)
    context.transaction = tx

    // process inputs and outputs
    for (let input of inputs) {
      processInput(input, state, context)
    }
    for (let output of outputs) {
      processOutput(output, state, context)
    }
  }

  // run at the end of every block
  function blockHandler (state, context) {
    context = setContextProperties(state, context)

    for (let handlerName in handlers) {
      let blockHandler = handlers[handlerName].onBlock
      if (blockHandler == null) continue
      blockHandler(state[handlerName], context)
    }
  }

  return {
    initializers: [ initializer ],
    transactionHandlers: [ txHandler ],
    blockHandlers: [ blockHandler ],
    methods
  }
}

// simple structure check for an input or an output
function putCheck (put) {
  if (typeof put.type !== 'string') {
    throw Error('Inputs and outputs must have a string `type`')
  }
  if (typeof put.amount !== 'number') {
    throw Error('Inputs and outputs must have a number `amount`')
  }
  if (put.amount < 0) {
    throw Error('Amount must be >= 0')
  }
  if (!Number.isInteger(put.amount)) {
    throw Error('Amount must be an integer')
  }
  if (!Number.isSafeInteger(put.amount)) {
    throw Error('Amount must be < 2^53')
  }
}

function sumAmounts (puts) {
  let sum = puts.reduce((sum, { amount }) => sum + amount, 0)
  if (!Number.isSafeInteger(sum)) {
    throw Error('Amount overflow')
  }
  return sum
}

module.exports = coins
