const noHandlersError = Error('Must specify one or more account handlers')

function accounts (handlers) {
  if (handlers == null) {
    throw noHandlersError
  }

  // check if handlers obj is actually a single handler
  let singleHandler = true
  try {
    checkHandler(handlers)
  } catch (err) {
    singleHandler = false
  }

  // ensure handlers implement interface correctly
  if (singleHandler) {
    var handler = handlers
    checkHandler(handler)
  } else {
    let values = Object.values(handlers)
    if (values.length === 0) {
      throw noHandlersError
    }
    for (let handler of values) {
      checkHandler(handler)
    }
  }

  return {
    // on spend, debit from sender's account
    onInput (input, state, context) {
      let { amount, sequence, accountType } = input

      if (!Number.isInteger(sequence)) {
        throw Error('Sequence number must be an integer')
      }

      if (!singleHandler) {
        if (typeof accountType !== 'string') {
          throw Error('Account type must be a string')
        }

        // get account handler from 'accountType' value
        handler = handlers[accountType]
        if (handler == null) {
          throw Error(`Unknown account handler "${accountType}"`)
        }
      }

      // get account
      let address = handler.getAddress(input)
      let account = getAccount(state, address)

      // verify account balance/sequence
      if (account.balance < amount) {
        throw Error('Insufficient funds')
      }
      if (sequence !== account.sequence) {
        throw Error('Sequence number mismatch')
      }

      // should throw if input is not allowed to spend
      handler.onSpend(input, context)

      // debit account
      account.balance -= amount
      account.sequence += 1
    },

    // for each output of this type, add to account
    onOutput ({ address, amount }, state, context) {
      if (typeof address !== 'string') {
        throw Error('Address is required')
      }
      if (!Number.isSafeInteger(amount)) {
        throw Error('Invalid amount')
      }

      // initialize empty accounts
      if (state[address] == null) {
        state[address] = { balance: 0, sequence: 0 }
      }

      // add to account
      state[address].balance += amount

      // sanity check, prevents overflow
      if (!Number.isSafeInteger(state[address].balance)) {
        throw Error('Error adding to account balance')
      }
    },

    initialize (state, context, coinOpts) {
      let initialBalances = coinOpts.initialBalances
      if (initialBalances == null) return

      // inititialize accounts specified in coin options
      for (let address in initialBalances) {
        let balance = initialBalances[address]
        state[address] = { sequence: 0, balance }
      }
    }
  }
}

function checkHandler ({ onSpend, getAddress }) {
  if (typeof onSpend !== 'function') {
    throw Error('Account handler must specify an onSpend function')
  }
  if (typeof getAddress !== 'function') {
    throw Error('Account handler must specify a getAddress function')
  }
}

function getAccount (state, address) {
  let account = state[address]
  if (account == null) {
    throw Error(`Non-existent account "${address}"`)
  }
  return account
}

module.exports = accounts
module.exports.getAccount = getAccount
