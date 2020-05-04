/* global ecomCart */

ecomCart.on('addItem', ({ data, item }) => {
  console.log('New item added to cart:', item)
  console.log('Current cart data:', data)
})

const customCart = new ecomCart.Constructor()
console.log(customCart)

ecomCart.addItem({
  _id: '12300000000000000000000f',
  product_id: '123a5432109876543210cdef',
  sku: 's-MP_2B4',
  name: 'Mens Pique Polo Shirt',
  quantity: 4,
  price: 42.9,
  keep_item_price: false
})

ecomCart.on('change', ({ data }) => {
  console.log('Cart was changed again')
})

ecomCart.increaseItemQnt('12300000000000000000000f', 3)
