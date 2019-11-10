# old

[![npm version](https://img.shields.io/npm/v/old.svg)](https://www.npmjs.com/package/old)

**Make the 'new' keyword optional for ES6 classes**

## Usage

`npm install old`

```js
var old = require('old')

class Class {
  // ...
}

var Class2 = old(Class)

Class() // throws error
Class2() // creates an instance of Class
```

## Rationale

With ES5 "constructor" functions, a common pattern is to make the `new` keyword optional by doing something like the following:
```js
function Foo () {
  if (!(this instanceof Foo)) return new Foo()
  // do constructor stuff
}
```

Recently, ES6 introduced classes to replace constructor functions. However, if these classes are instantiated without `new`, an error is thrown: `TypeError: Class constructor Foo cannot be invoked without 'new'`. This module makes `new` optional, even for these ES6 classes.

## Credit

- Thank you to Sorella in ##javascript (Freenode) for the clean solution
- Thanks to slikts in ##javascript for the name idea
