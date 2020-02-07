# LinkedList [![build status](https://secure.travis-ci.org/kilianc/node-linkedlist.png?branch=master)](http://travis-ci.org/kilianc/node-linkedlist)

LinkedList is a data structure which implements an array friendly interface

# Class Methods

```javascript
LinkedList.prototype.push(data)
LinkedList.prototype.pop()
LinkedList.prototype.unshift(data)
LinkedList.prototype.shift()
LinkedList.prototype.next()
LinkedList.prototype.unshiftCurrent()
LinkedList.prototype.removeCurrent()
LinkedList.prototype.resetCursor()
```

# Class Getters

```javascript
LinkedList.prototype.length
LinkedList.prototype.head
LinkedList.prototype.tail
LinkedList.prototype.current
```

# Example

```javascript

var LinkedList = require('linkedlist')

var list = new LinkedList()

for (var i = 0; i < 10; i++) {
  list.push(i.toString())
}

console.log(list.head)
console.log(list.tail)

while (list.next()) {
  console.log(list.current)
}

while (list.length) {
  console.log(list.pop())
}

for (i = 0; i < 10; i++) {
  list.unshift(i.toString())
}

while (list.length) {
  console.log(list.shift())
}

for (i = 0; i < 10; i++) {
  list.push(i.toString())
}

while (list.next()) {
  if (list.current === '5') {
    console.log('move "%s" to the start of the list', list.unshiftCurrent())
  }
  if (list.current === '8') {
    console.log('remove "%s" current from the list', list.removeCurrent())
    // now list.current points to '7'
    // now list.next() points to '9'

    list.resetCursor()
    // now list.next() points to list.head
  }
}

```

Look at the test suite for more example

# How to contribute

This repository follows (more or less) the [Felix's Node.js Style Guide](http://nodeguide.com/style.html), your contribution must be consistent with this style.

The test suite is written on top of [visionmedia/mocha](http://visionmedia.github.com/mocha/) and it took hours of hard work. Please use the tests to check if your contribution is breaking some part of the library and add new tests for each new feature.

    ⚡ npm test

and for your test coverage

    ⚡ make test-cov

## License

_This software is released under the MIT license cited below_.

    Copyright (c) 2010 Kilian Ciuffolo, me@nailik.org. All Rights Reserved.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the 'Software'), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:
    
    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
