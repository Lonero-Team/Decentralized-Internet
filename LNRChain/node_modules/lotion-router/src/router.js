'use strict'

const old = require('old')

function Router (routes) {
  if (routes == null || typeof routes !== 'object') {
    throw Error('Must provide routes object')
  }

  let blockHandlers = getAllHandlers(routes, 'blockHandlers')
  let initializers = getAllHandlers(routes, 'initializers')

  // lotion tx handler
  function txHandler (state, tx, context) {
    if (tx.type == null) {
      throw Error('Must provide type')
    }
    if (typeof tx.type !== 'string') {
      throw Error('Type must be a string')
    }

    // TODO: recursive route handling (paths)

    let route = routes[tx.type]
    if (route == null) {
      throw Error(`No route found for "${tx.type}"`)
    }
    // special case: single function is tx handler
    if (typeof route === 'function') {
      route = { transactionHandlers: [ route ] }
    }
    if (!route.transactionHandlers) {
      throw Error(`No tx handlers defined for route "${tx.type}"`)
    }

    let substate = getSubstate(state, tx.type)

    setContextProperties(state, context, tx.type)

    for (let handler of route.transactionHandlers) {
      handler(substate, tx, context)
    }
  }

  // lotion block handler
  function blockHandler (state, context) {
    setContextProperties(state, context)
    for (let { route, handlers } of blockHandlers) {
      let substate = getSubstate(state, route)
      handlers.forEach((handler) => handler(substate, context))
    }
  }

  // lotion initialization handler
  function initializer (state, context) {
    for (let route in routes) {
      let substate = state[route]

      if (routes[route].initialState != null) {
        if (route in state) {
          throw Error(`Route "${route}" has initialState, but state.${route} already exists`)
        }
        substate = routes[route].initialState
      }

      state[route] = substate || {}
    }

    setContextProperties(state, context)

    for (let { route, handlers } of initializers) {
      let substate = state[route]
      handlers.forEach((handler) => handler(substate, context))
    }
  }

  function setContextProperties (state, context, currentRoute) {
    // get exported methods from other routes
    // TODO: do this once and just update the closure variables (state/context)
    let exportedMethods = {}
    for (let [ routeName, route ] of Object.entries(routes)) {
      if (currentRoute != null && routeName === currentRoute) continue
      if (route.methods == null) continue
      // define getter, so we bind the methods as they are accessed
      Object.defineProperty(exportedMethods, routeName, {
        get () {
          let substate = getSubstate(state, routeName)
          // TODO: use a more complete way of making object read-only
          return new Proxy(route.methods, {
            get (obj, key) {
              if (typeof obj[key] !== 'function') {
                throw Error('Got non-function in methods')
              }
              // use the external route's own substate as first arg
              return obj[key].bind(null, substate)
            },
            set () {
              throw Error('Route methods are read-only')
            }
          })
        }
      })
    }

    // expose root state, just in case
    context.rootState = state

    // exported methods from other routes
    context.modules = exportedMethods
  }

  // returns a lotion module
  return {
    transactionHandlers: [ txHandler ],
    blockHandlers: [ blockHandler ],
    initializers: [ initializer ]
    // TODO: export methods
  }
}

function getAllHandlers (routes, type) {
  let output = []

  let addHandlers = (routeName, module) => {
    // special case: single function is tx handler
    if (typeof module === 'function') {
      module = { transactionHandlers: [ module ] }
    }

    if (module[type] == null) return
    output.push({
      route: routeName,
      handlers: module[type]
    })
  }

  for (let routeName in routes) {
    let module = routes[routeName]
    addHandlers(routeName, module)
  }

  return output
}

function getSubstate (state, key) {
  let substate = state[key]
  if (substate == null) {
    throw Error(`Substate "${key}" does not exist`)
  }
  return substate
}

module.exports = old(Router)
