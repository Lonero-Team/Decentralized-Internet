/**
 * @method
 * @name EcomCart#clear
 * @description Remove all items from cart and save.
 *
 * @param {boolean} [canSave=true] - Save empty cart to local storage
 *
 * @returns {self}
 *
 * @example

ecomCart.clear()

 */

export default (self, emitter, [canSave = true]) => {
  const { data, save } = self

  data.items = []
  if (data.subtotal) {
    data.subtotal = 0
  }

  /**
   * @event EcomCart#clear
   * @type {object}
   * @property {object} data - Shopping cart data
   * @example ecomCart.on('clear', ({ data }) => { console.log(data.subtotal === 0) })
   */
  emitter.emit('clear', { data })

  if (canSave) {
    save(false)
  }
  return self
}
