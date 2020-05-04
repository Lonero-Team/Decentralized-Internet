import { price } from '@ecomplus/utils'

/**
 * @method
 * @name EcomCart#addProduct
 * @description Parse product object to item, push to cart and save.
 *
 * @param {object} product -
 * [Product object]{@link https://developers.e-com.plus/docs/api/#/store/products/products}
 * @param {string} [variationId] - ID of selected variation if any
 * @param {number} [quantity=1] - Item quantity added
 * @param {boolean} [canSave=true] - Save cart data
 *
 * @returns {object|null} Returns the saved item object (with `_id`) or null
 * when new item object is invalid.
 *
 * @example

ecomCart.addProduct({
  _id: '123a5432109876543210cdef',
  sku: 's-MP_2B4',
  commodity_type: 'physical',
  name: 'Mens Pique Polo Shirt',
  slug: 'mens-pique-polo-shirt',
  available: true,
  visible: true,
  price: 42.9,
  price_effective_date: {
    end: '2018-12-01T10:00:00.612Z'
  },
  base_price: 60,
  currency_id: 'BRL',
  currency_symbol: 'R$',
  quantity: 100
})

 */

export default ({ addItem }, emitter, [product, variationId, quantity = 1, canSave = true]) => {
  const item = !variationId || !product.variations
    ? product : product.variations.find(({ _id }) => _id === variationId)
  item.product_id = product._id

  if (variationId) {
    item.variation_id = variationId
    item.slug = product.slug
    if (item.picture_id && product.pictures) {
      const pictures = product.pictures.filter(picture => {
        return picture._id === item.picture_id
      })
      if (pictures.length) {
        item.picture = pictures[0]
      }
    }
  }

  if (!item.picture && product.pictures) {
    item.picture = product.pictures[0]
  }
  item.quantity = item.min_quantity || product.min_quantity || quantity
  item.price = price(item) || price(product)

  return addItem(item, canSave)
}
