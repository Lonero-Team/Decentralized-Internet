var should = require('should'),
    LinkedList = require('../')

var list

describe('LinkedList', function () {
  describe('#push()', function () {
    before(function () {
      list = new LinkedList()
      for (var i = 0; i < 5; i++) {
        list.push(i.toString())
      }
    })
    it('should update length', function () {
      list.length.should.be.equal(5)
    })
    it('should update head', function () {
      list.head.should.be.equal('0')
    })
    it('should update tail', function () {
      list.tail.should.be.equal('4')
    })
    it('should update current', function () {
      list.current.should.be.equal('0')
    })
  })
  describe('#pop()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
      })
      it('should return undefined', function () {
        should.not.exist(list.pop())
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(0)
      })
      it('should update head', function () {
        should.not.exist(list.head)
      })
      it('should update tail', function () {
        should.not.exist(list.tail)
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 5; i++) {
          list.push(i.toString())
        }
      })
      it('should return the last value', function () {
        list.pop().should.be.equal('4')
      })
      it('should deincrease length', function () {
        list.length.should.be.equal(4)
      })
      it('should update head', function () {
        list.head.should.be.equal('0')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('3')
      })
      it('should update current', function () {
        list.current.should.be.equal('0')
      })
      it('should be able to empty the list', function () {
        list.pop().should.be.equal('3')
        list.pop().should.be.equal('2')
        list.pop().should.be.equal('1')
        list.pop().should.be.equal('0')
        list.length.should.be.equal(0)
        should.not.exist(list.head)
        should.not.exist(list.tail)
      })
      it('should return undefined on an empty list', function () {
        should.not.exist(list.pop())
        list.length.should.be.equal(0)
      })
      it('should not decrease after zero', function () {
        list.pop()
        list.length.should.be.equal(0)
      })
      it('should update current', function () {
        should.not.exist(list.current)
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
    })
    describe('cursor at tail', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 5; i++) {
          list.push(i.toString())
        }
        while (list.next());
      })
      it('should return the last value', function () {
        list.pop().should.be.equal('4')
      })
      it('should deincrease length', function () {
        list.length.should.be.equal(4)
      })
      it('should update head', function () {
        list.head.should.be.equal('0')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('3')
      })
      it('should update current', function () {
        list.current.should.be.equal('3')
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
    })
    describe('cursor at middle', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        for (i = 0; i < 5; i++) {
          list.next()
        }
      })
      it('should return the last value', function () {
        list.pop().should.be.equal('9')
        list.pop().should.be.equal('8')
        list.pop().should.be.equal('7')
        list.pop().should.be.equal('6')
        list.pop().should.be.equal('5')
        list.pop().should.be.equal('4')
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(4)
      })
      it('should update head', function () {
        list.head.should.be.equal('0')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('3')
      })
      it('should update current', function () {
        list.current.should.be.equal('3')
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
    })
  })
  describe('#shift()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
      })
      it('should return undefined', function () {
        should.not.exist(list.shift())
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(0)
      })
      it('should update head', function () {
        should.not.exist(list.head)
      })
      it('should update tail', function () {
        should.not.exist(list.tail)
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 5; i++) {
          list.push(i.toString())
        }
      })
      it('should return the first value', function () {
        list.shift().should.be.equal('0')
      })
      it('should deincrease length', function () {
        list.length.should.be.equal(4)
      })
      it('should update head', function () {
        list.head.should.be.equal('1')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('4')
      })
      it('should be able to empty the list', function () {
        list.shift().should.be.equal('1')
        list.shift().should.be.equal('2')
        list.shift().should.be.equal('3')
        list.shift().should.be.equal('4')
        list.length.should.be.equal(0)
        should.not.exist(list.head)
        should.not.exist(list.tail)
      })
      it('should return undefined on an empty list', function () {
        should.not.exist(list.shift())
        list.length.should.be.equal(0)
      })
      it('should not decrease after zero', function () {
        list.shift()
        list.length.should.be.equal(0)
      })
    })
    describe('cursor at tail', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 5; i++) {
          list.push(i.toString())
        }
        while (list.next());
      })
      it('should return the last value', function () {
        list.shift().should.be.equal('0')
      })
      it('should deincrease length', function () {
        list.length.should.be.equal(4)
      })
      it('should update head', function () {
        list.head.should.be.equal('1')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('4')
      })
      it('should update current', function () {
        list.current.should.be.equal('4')
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
    })
    describe('cursor at middle', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        for (i = 0; i < 5; i++) {
          list.next()
        }
      })
      it('should return the last value', function () {
        list.shift().should.be.equal('0')
        list.shift().should.be.equal('1')
        list.shift().should.be.equal('2')
        list.shift().should.be.equal('3')
        list.shift().should.be.equal('4')
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(5)
      })
      it('should update head', function () {
        list.head.should.be.equal('5')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('9')
      })
      it('should update current', function () {
        list.current.should.be.equal('5')
      })
      it('should update next', function () {
        list.next().should.be.equal('6')
      })
    })
  })
  describe('#unshift()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
        list.unshift('head')
      })
      it('should update length', function () {
        list.length.should.be.equal(1)
      })
      it('should update head', function () {
        list.head.should.be.equal('head')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('head')
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        list.push('foo')
        list.push('bar')
        list.push('f')
        list.push('o')
        list.push('o')
        list.push('o')
        list.unshift('head')
      })
      it('should update length', function () {
        list.length.should.be.equal(7)
      })
      it('should update head', function () {
        list.head.should.be.equal('head')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('o')
      })
    })
  })
  describe('#next()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
      })
      it('should return undefined', function () {
        should.not.exist(list.next())
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i)
        }
      })
      it('should iterate correctly', function () {
        var i = 0
        while (list.next() !== undefined) {
          list.current.should.be.equal(i++)
        }
        i.should.be.equal(10)
      })
    })
  })
  describe('#resetCursor()', function () {
    before(function () {
      list = new LinkedList()
      for (var i = 0; i < 10; i++) {
        list.push(i)
      }
      list.next()
      list.next()
      list.resetCursor()
    })
    it('should reset the cursor position', function () {
      list.current.should.be.equal(0)
      list.next().should.be.equal(0)
      list.next().should.be.equal(1)
    })
  })
  describe('#removeCurrent()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
      })
      it('should return undefined', function () {
        should.not.exist(list.removeCurrent())
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(0)
      })
      it('should update head', function () {
        should.not.exist(list.head)
      })
      it('should update tail', function () {
        should.not.exist(list.tail)
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
      })
      it('should return the first value', function () {
        list.removeCurrent().should.be.equal('0')
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(9)
      })
      it('should update head', function () {
        list.head.should.be.equal('1')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('9')
      })
      it('should update current', function () {
        list.current.should.be.equal('1')
      })
      it('should update next', function () {
        list.next().should.be.equal('2')
      })
      it('should be able to empty the list', function () {
        while (list.removeCurrent());
        list.length.should.be.equal(0)
        should.not.exist(list.next())
        should.not.exist(list.current)
        should.not.exist(list.head)
        should.not.exist(list.tail)
      })
    })
    describe('cursor at tail', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        while (list.next());
      })
      it('should return the last value', function () {
        list.removeCurrent().should.be.equal('9')
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(9)
      })
      it('should update head', function () {
        list.head.should.be.equal('0')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('8')
      })
      it('should update current', function () {
        list.current.should.be.equal('8')
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
      it('should be able to empty the list', function () {
        while (list.removeCurrent());
        list.length.should.be.equal(0)
        should.not.exist(list.next())
        should.not.exist(list.current)
        should.not.exist(list.head)
        should.not.exist(list.tail)
      })
    })
    describe('cursor at middle', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        for (i = 0; i < 5; i++) {
          list.next()
        }
      })
      it('should return the last value', function () {
        list.removeCurrent().should.be.equal('4')
      })
      it('should not deincrease length', function () {
        list.length.should.be.equal(9)
      })
      it('should update head', function () {
        list.head.should.be.equal('0')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('9')
      })
      it('should update current', function () {
        list.current.should.be.equal('3')
      })
      it('should update next', function () {
        list.next().should.be.equal('5')
      })
      it('should be able to empty the list', function () {
        while (list.removeCurrent());
        list.length.should.be.equal(0)
        should.not.exist(list.next())
        should.not.exist(list.current)
        should.not.exist(list.head)
        should.not.exist(list.tail)
      })
    })
  })
  describe('#unshiftCurrent()', function () {
    describe('empty list', function () {
      before(function () {
        list = new LinkedList()
      })
      it('should return undefined', function () {
        should.not.exist(list.unshiftCurrent())
      })
    })
    describe('cursor at head', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
      })
      it('should return current value', function () {
        list.unshiftCurrent().should.be.equal('0')
      })
      it('should update current', function () {
        list.current.should.be.equal('0')
      })
      it('should update next', function () {
        list.next().should.be.equal('0')
      })
    })
    describe('cursor at tail', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        while (list.next());
      })
      it('should return undefined', function () {
        list.unshiftCurrent().should.be.equal('9')
      })
      it('should update tail', function () {
        list.tail.should.be.equal('8')
      })
      it('should update head', function () {
        list.head.should.be.equal('9')
      })
      it('should update current', function () {
        list.current.should.be.equal('8')
      })
      it('should update next', function () {
        should.not.exist(list.next())
      })
      it('should bubble up nodes', function () {
        var v = 0
        for (var i = 0; i < 20; i++) {
          v = (v + 1) % 10
          list.unshiftCurrent().should.be.equal((9-v).toString())
        }
      })
    })
    describe('cursor at middle', function () {
      before(function () {
        list = new LinkedList()
        for (var i = 0; i < 10; i++) {
          list.push(i.toString())
        }
        for (i = 0; i < 5; i++) {
          list.next()
        }
      })
      it('should return current value', function () {
        list.unshiftCurrent().should.be.equal('4')
      })
      it('should update current', function () {
        list.current.should.be.equal('3')
      })
      it('should update next', function () {
        list.next().should.be.equal('5')
      })
    })
  })
})