import { randomObjectId } from '@ecomplus/utils'
import fixItemQuantity from './../lib/fix-item-quantity'
import fixSubtotal from './../lib/fix-subtotal'

/**
 * @method
 * @name EcomCart#addItem
 * @description Push new item to cart data and save.
 *
 * @param {object} newItem - New cart item object valid for
 * {@link https://developers.e-com.plus/docs/api/#/store/carts/carts E-Com Plus `cart.items`}
 * @param {boolean} [canSave=true] - Save cart data
 *
 * @returns {object|null} Returns the saved item object (with `_id`) or null
 * when new item object is invalid.
 *
 * @example

ecomCart.addItem({
  _id: '12300000000000000000000f',
  product_id: '123a5432109876543210cdef',
  sku: 's-MP_2B4',
  name: 'Mens Pique Polo Shirt',
  quantity: 4,
  price: 42.9,
  keep_item_price: false
})

 */

export default ({ data, save }, emitter, [newItem, canSave = false]) => {
  if (
    typeof newItem.product_id !== 'string' ||
    typeof newItem.quantity !== 'number' || !(newItem.quantity >= 0) ||
    typeof newItem.price !== 'number' || !(newItem.price >= 0)
  ) {
    return null
  }

  let fixedItem
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i]
    if (item.product_id === newItem.product_id && item.variation_id === newItem.variation_id) {
      item.quantity += newItem.quantity
      if (newItem.price) {
        item.price = newItem.price
      }
      if (newItem.final_price) {
        item.final_price = newItem.final_price
      }
      fixedItem = fixItemQuantity(item)
    }
  }

  if (!fixedItem) {
    if (!newItem._id) {
      newItem._id = randomObjectId()
    }
    data.items.push(newItem)
    fixedItem = fixItemQuantity(newItem)
  }
  fixSubtotal(data)

  /**
   * @event EcomCart#addItem
   * @type {object}
   * @property {object} data - Shopping cart data
   * @property {object} item - Item added to cart
   * @example ecomCart.on('addItem', ({ data, item }) => { console.log(data, item) })
   */
  emitter.emit('addItem', { data, item: fixedItem })

  if (canSave) {
    save(false)
  }
  return fixedItem
}
