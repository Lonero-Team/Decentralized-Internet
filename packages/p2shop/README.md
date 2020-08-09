# This package is under construction and not yet in a production ready environment

# p2shop
Ecom plus shopping cart library w/ Decentralized Internet SDK

# TODO:
**Update src/ + config.json**

# shopping-cart

[![license mit](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Simple vanilla JS library to handle shopping cart with
common methods following
[E-Com Plus cart object model](https://developers.e-com.plus/docs/api/#/store/carts/carts)

[Changelog](https://github.com/ecomclub/shopping-cart/blob/master/CHANGELOG.md)

## Usage

The `@ecomplus/shopping-cart` package can be used to persist
and treat shopping cart data on E-Com Plus stores (and not only).

It's available for both Node.js and browser environments.

- [Get started](https://developers.e-com.plus/shopping-cart/module-@ecomplus_shopping-cart.html)
- [Class reference](https://developers.e-com.plus/shopping-cart/EcomCart.html)

### Example

```js
import ecomCart from '@ecomplus/shopping-cart'

ecomCart.on('change', ({ data }) => {
  console.log('Cart was changed!')
  console.log('Current cart data:', data)
})

ecomCart.addItem({
  _id: '12300000000000000000000f',
  product_id: '123a5432109876543210cdef',
  sku: 's-MP_2B4',
  name: 'Mens Pique Polo Shirt',
  quantity: 4,
  price: 42.9,
  keep_item_price: false
})

ecomCart.increaseItemQnt('12300000000000000000000f', 3)
```

### Dependencies

It requires and _may not_ include:

- `core-js`;
- [`eventemitter3`](https://github.com/primus/eventemitter3);
- [`@ecomplus/utils`](https://github.com/ecomclub/ecomplus-utils);

#### Node.js

```bash
npm i --save @ecomplus/utils @ecomplus/shopping-cart
```

#### Webpack

```bash
npm i --save core-js @ecomplus/utils @ecomplus/shopping-cart
```

#### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@ecomplus/shopping-cart/dist/ecom-cart.var.min.js"></script>
```

`EventEmitter3` and `ecomUtils` libraries **must be included separately**
and available on window scope.
