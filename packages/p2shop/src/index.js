/*!
 * @ecomplus/shopping-cart
 * (c) E-Com Club <ti@e-com.club>
 * Released under the MIT License.
 */

/**
 * Simple JS library to handle shopping cart object and events on E-Com Plus (not only) stores.
 * {@link https://github.com/ecomclub/shopping-cart GitHub}
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 *
 * @module @ecomplus/shopping-cart
 * @return {EcomCart} Default `EcomCart` instance object.
 * @see ecomCart
 * @see EcomCart
 *
 * @example
 * // ES import default
 * import ecomCart from '@ecomplus/shopping-cart'
 *
 * @example
 * // Optional named ES import for default instance and constructor
 * import { ecomCart, EcomCart } from '@ecomplus/shopping-cart'
 *
 * @example
 * // With CommonJS
 * const ecomCart = require('@ecomplus/shopping-cart')
 *
 * @example
 * <!-- Global `ecomCart` from CDN on browser -->
 * <script src="https://cdn.jsdelivr.net/npm/@ecomplus/shopping-cart/dist/ecom-cart.var.min.js"></script>
 *
 * @example
 * <!-- Bundle from CDN with `ecomUtils` and `EventEmitter3` -->
 * <script src="https://cdn.jsdelivr.net/npm/@ecomplus/shopping-cart/dist/ecom-cart.bundle.min.js"></script>
 */

import EcomCart from './constructor'

/**
 * Default `EcomCart` instance.
 * @global
 * @type EcomCart
 */

const ecomCart = new EcomCart()

export default ecomCart

export { ecomCart, EcomCart }
