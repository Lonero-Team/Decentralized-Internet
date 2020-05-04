# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.1](https://github.com/ecomclub/shopping-cart/compare/v2.1.0...v2.1.1) (2020-01-25)


### Bug Fixes

* **reset:** fix reseting self.data (by reference) ([548de25](https://github.com/ecomclub/shopping-cart/commit/548de25f7605374c220d897d2b1cdf699a76ea03))

## [2.1.0](https://github.com/ecomclub/shopping-cart/compare/v2.0.2...v2.1.0) (2020-01-25)


### Features

* **reset:** add new 'reset' method ([09807ca](https://github.com/ecomclub/shopping-cart/commit/09807ca36232987f8cb0b359fde4ab0d0c20338e))

### [2.0.2](https://github.com/ecomclub/shopping-cart/compare/v2.0.1...v2.0.2) (2020-01-07)

### [2.0.1](https://github.com/ecomclub/shopping-cart/compare/v2.0.0...v2.0.1) (2020-01-02)

## [2.0.0](https://github.com/ecomclub/shopping-cart/compare/v1.0.0...v2.0.0) (2019-12-26)


### ⚠ BREAKING CHANGES

* **deps:** ecomplus/utils and core-js no more direct dependencies

* **deps:** fix pkg dependencies (peer) ([4675931](https://github.com/ecomclub/shopping-cart/commit/46759313b22d165dde3cd4943c1e65b0efc4d900))

## [1.0.0](https://github.com/ecomclub/shopping-cart/compare/v0.6.3...v1.0.0) (2019-11-29)


### ⚠ BREAKING CHANGES

* **constructor:** changed default object exported

### Bug Fixes

* **import:** 'import * as EventEmitter' (no default export) ([ed88be5](https://github.com/ecomclub/shopping-cart/commit/ed88be5d855df2dd64a24b52d0d56409908e79cc))
* **methods:** fix methods params to support middleware (default events) ([93f8d34](https://github.com/ecomclub/shopping-cart/commit/93f8d342dfa23350f583928133016c1803a34b08))


* **constructor:** export an instance with .Constructor for new ones ([2bf6386](https://github.com/ecomclub/shopping-cart/commit/2bf6386f8554a1a02d992628aa37ce633716c5bf))

### [0.6.3](https://github.com/ecomclub/shopping-cart/compare/v0.6.2...v0.6.3) (2019-11-17)

### [0.6.2](https://github.com/ecomclub/shopping-cart/compare/v0.6.1...v0.6.2) (2019-09-12)


### Bug Fixes

* **remove-item:** fix event and self.save() on removeItem method ([59d1e3f](https://github.com/ecomclub/shopping-cart/commit/59d1e3f))

### [0.6.1](https://github.com/ecomclub/shopping-cart/compare/v0.6.1-alpha.0...v0.6.1) (2019-08-29)


### Bug Fixes

* **add-item:** fix handling 'addItem' (save) ([9ee9ef9](https://github.com/ecomclub/shopping-cart/commit/9ee9ef9))
* **constructor:** add each item one by one to fix it if needed ([874b000](https://github.com/ecomclub/shopping-cart/commit/874b000))
* **constructor:** fix constructor setup and some methods ([e64998a](https://github.com/ecomclub/shopping-cart/commit/e64998a))
* **constructor:** setup methods with args correctly ([8ae9f53](https://github.com/ecomclub/shopping-cart/commit/8ae9f53))
* **emitter:** emit constructor events on methods (.emit) ([4f9f196](https://github.com/ecomclub/shopping-cart/commit/4f9f196))
* **methods:** handling instance cart object with 'data' ([ec856b5](https://github.com/ecomclub/shopping-cart/commit/ec856b5))


### Features

* **add-item:** handling addItem method ([e8a09af](https://github.com/ecomclub/shopping-cart/commit/e8a09af))
* **add-product:** implement 'addProduct' method ([3ab6636](https://github.com/ecomclub/shopping-cart/commit/3ab6636))
* **clear:** add 'clear' method ([7752491](https://github.com/ecomclub/shopping-cart/commit/7752491))
* **emitter:** add events emmiter to constructor ([6f01886](https://github.com/ecomclub/shopping-cart/commit/6f01886))
* **emitter:** emit constructor events on methods ([1cde35f](https://github.com/ecomclub/shopping-cart/commit/1cde35f))
* **increase-item-qnt:** handle 'increaseItemQnt' method ([764c007](https://github.com/ecomclub/shopping-cart/commit/764c007))
* **remove-item:** handle 'removeItem' method ([03551f1](https://github.com/ecomclub/shopping-cart/commit/03551f1))
* **save:** add 'save' method ([26206b9](https://github.com/ecomclub/shopping-cart/commit/26206b9))
* **storage:** try to preset cart data from storage ([eea39e1](https://github.com/ecomclub/shopping-cart/commit/eea39e1))

### [0.6.1-alpha.0](https://github.com/ecomclub/shopping-cart/compare/v0.3.0...v0.6.1-alpha.0) (2019-08-29)


### Bug Fixes

* handle export even if window object is available ([3c3372f](https://github.com/ecomclub/shopping-cart/commit/3c3372f))
* prevent fatal error with undefined module ([36f4474](https://github.com/ecomclub/shopping-cart/commit/36f4474))
