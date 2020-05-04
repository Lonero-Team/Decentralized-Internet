import { $ecomConfig, randomObjectId } from '@ecomplus/utils'
import * as EventEmitter from 'eventemitter3'

import addItem from './methods/add-item'
import addPoduct from './methods/add-product'
import increaseItemQnt from './methods/increase-item-qnt'
import removeItem from './methods/remove-item'
import save from './methods/save'
import clear from './methods/clear'
import reset from './methods/reset'

const defaultStorage = typeof window === 'object' && window.localStorage

/**
 * Construct a new shopping cart instance object.
 * @constructor
 * @param {number} [storeId=$ecomConfig.get('store_id')] - Preset Store ID number
 * @param {string|null} [storageKey] - Item key to persist cart data
 * @param {object} [localStorage=window.localStorage] -
 * [Local Storage interface]{@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}
 *
 * @example

// Default instance
const ecomCart = new EcomCart()

 * @example

// Defining Store ID other than the configured on `$ecomConfig`
const storeId = 2000
const customEcomCart = new EcomCart(storeId)

 */

const EcomCart = function (storeId, storageKey = 'ecomShoppingCart', localStorage = defaultStorage) {
  const ecomCart = this

  /**
   * Construct a new shopping cart instance object.
   * @memberof EcomCart
   * @type {function}
   * @see EcomCart
   */
  ecomCart.Constructor = EcomCart

  /**
   * Respective Store ID number.
   * @memberof EcomCart
   * @type {number}
   */
  ecomCart.storeId = storeId || $ecomConfig.get('store_id')

  /**
   * Item key to handle persistent JSON {@link EcomCart#data}
   * with [localStorage]{@link EcomCart#localStorage}.
   * @memberof EcomCart
   * @type {string|null}
   */
  ecomCart.storageKey = storageKey

  /**
   * [Storage interface]{@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage}.
   * @memberof EcomCart
   * @type {object}
   */
  ecomCart.localStorage = localStorage

  /**
   * Shopping cart data following
   * {@link https://developers.e-com.plus/docs/api/#/store/carts/carts E-Com Plus cart object model}.
   * @memberof EcomCart
   * @type {object}
   * @property {string} _id - Cart object ID
   * @property {array<object>} items - List of cart items
   * @property {number} subtotal - Cart subtotal value
   */
  ecomCart.data = {
    items: [],
    subtotal: 0
  }

  const emitter = new EventEmitter()
  ;['on', 'off', 'once'].forEach(method => {
    ecomCart[method] = (ev, fn) => {
      emitter[method](ev, fn)
    }
  })

  const methodsMiddleware = (method, args = [], emitChange = true) => {
    const result = method(ecomCart, emitter, args)
    if (result && emitChange) {
      const { data } = ecomCart

      /**
       * @event EcomCart#change
       * @type {object}
       * @property {object} data - Shopping cart data
       * @example ecomCart.on('change', ({ data }) => { console.log(data.items) })
       */
      emitter.emit('change', { data })
    }
    return result
  }

  this.addItem = (newItem, canSave) => {
    return methodsMiddleware(addItem, [newItem, canSave])
  }

  this.addProduct = (product, variationId, quantity, canSave) => {
    return methodsMiddleware(addPoduct, [product, variationId, quantity, canSave])
  }

  this.increaseItemQnt = (itemId, quantity, canSave) => {
    return methodsMiddleware(increaseItemQnt, [itemId, quantity, canSave])
  }

  this.removeItem = (itemId, canSave) => {
    return methodsMiddleware(removeItem, [itemId, canSave])
  }

  this.clear = (canSave) => {
    return methodsMiddleware(clear, [canSave])
  }

  this.reset = (canSave) => {
    return methodsMiddleware(reset, [canSave])
  }

  this.save = (canFixSubtotal) => {
    return methodsMiddleware(save, [canFixSubtotal], false)
  }

  if (localStorage && storageKey) {
    const json = localStorage.getItem(storageKey)
    if (json) {
      let data
      try {
        data = JSON.parse(json)
      } catch (e) {
        // ignore invalid JSON
      }
      if (data && Array.isArray(data.items)) {
        ecomCart.data = data
      }
    }
  }

  if (!ecomCart.data._id) {
    ecomCart.data._id = randomObjectId()
  }
}

export default EcomCart
