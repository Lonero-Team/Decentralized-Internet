import fixSubtotal from './../lib/fix-subtotal'

/**
 * @method
 * @name EcomCart#removeItem
 * @description Remove specific item from cart by ID.
 *
 * @param {string} itemId - The unique object ID of item
 * @param {boolean} [canSave=true] - Save cart data
 *
 * @returns {object|null} Returns the removed item object or null
 * when item not found.
 *
 * @example

ecomCart.removeItem('12300000000000000000000f')

 */

export default ({ data, save }, emitter, [itemId, canSave = true]) => {
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    if (item._id === itemId) {
      data.items.splice(i, 1)
      fixSubtotal(data)

      /**
       * @event EcomCart#removeItem
       * @type {object}
       * @property {object} data - Shopping cart data
       * @property {object} item - Cart item removed
       * @example ecomCart.on('removeItem', ({ data, item }) => { console.log(data, item) })
       */
      emitter.emit('removeItem', { data, item })

      if (canSave) {
        save(false)
      }
      return item
    }
  }

  return null
}
