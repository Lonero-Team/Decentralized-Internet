'use strict';

const assert = require('assertthat');

const hex = require('../lib/hex');

suite('hex', () => {
  suite('pow2x', () => {
    test('2 ^ 0 => 1', done => {
      assert.that(hex.pow2x(0)).is.equalTo('1');
      done();
    });

    test('2 ^ 1 => 2', done => {
      assert.that(hex.pow2x(1)).is.equalTo('2');
      done();
    });

    test('2 ^ 2 => 4', done => {
      assert.that(hex.pow2x(2)).is.equalTo('4');
      done();
    });

    test('2 ^ 3 => 8', done => {
      assert.that(hex.pow2x(3)).is.equalTo('8');
      done();
    });

    test('2 ^ 4 => 10', done => {
      assert.that(hex.pow2x(4)).is.equalTo('10');
      done();
    });

    test('2 ^ 5 => 20', done => {
      assert.that(hex.pow2x(5)).is.equalTo('20');
      done();
    });

    test('2 ^ 6 => 40', done => {
      assert.that(hex.pow2x(6)).is.equalTo('40');
      done();
    });

    test('2 ^ 7 => 80', done => {
      assert.that(hex.pow2x(7)).is.equalTo('80');
      done();
    });

    test('2 ^ 8 => 100', done => {
      assert.that(hex.pow2x(8)).is.equalTo('100');
      done();
    });

    test('2 ^ 159 => 8000000000000000000000000000000000000000', done => {
      assert.that(hex.pow2x(159)).is.equalTo('8000000000000000000000000000000000000000');
      done();
    });
  });

  suite('add', () => {
    suite('single digit', () => {
      suite('without overflow', () => {
        test('0 + 1 => 1', done => {
          assert.that(hex.add('0', '1')).is.equalTo('1');
          done();
        });

        test('0 + c => c', done => {
          assert.that(hex.add('0', 'c')).is.equalTo('c');
          done();
        });

        test('a + 3 => d', done => {
          assert.that(hex.add('a', '3')).is.equalTo('d');
          done();
        });
      });

      suite('with overflow', () => {
        test('d + 6 => 3', done => {
          assert.that(hex.add('d', '6')).is.equalTo('3');
          done();
        });

        test('f + 1 => 0', done => {
          assert.that(hex.add('f', '1')).is.equalTo('0');
          done();
        });

        test('f + a => 9', done => {
          assert.that(hex.add('f', 'a')).is.equalTo('9');
          done();
        });
      });
    });

    suite('multiple digits', () => {
      suite('without overflow', () => {
        test('1 + f3 => f4', done => {
          assert.that(hex.add('1', 'f3')).is.equalTo('f4');
          done();
        });

        test('f3 + 1 => f4', done => {
          assert.that(hex.add('f3', '1')).is.equalTo('f4');
          done();
        });

        test('20 + 20 => 40', done => {
          assert.that(hex.add('20', '20')).is.equalTo('40');
          done();
        });

        test('a3dc + 1c => a3f8', done => {
          assert.that(hex.add('a3dc', '1c')).is.equalTo('a3f8');
          done();
        });

        test('74d4fb84cd8479953830f31e5bfec2fcde452760 + 74d4fb84cd8479953830f31e5bfec2fcde452760 => e9a9f7099b08f32a7061e63cb7fd85f9bc8a4ec0', done => {
          assert.that(hex.add('74d4fb84cd8479953830f31e5bfec2fcde452760', '74d4fb84cd8479953830f31e5bfec2fcde452760')).is.equalTo('e9a9f7099b08f32a7061e63cb7fd85f9bc8a4ec0');
          done();
        });
      });

      suite('with overflow', () => {
        test('fe + 2 => 00', done => {
          assert.that(hex.add('fe', '2')).is.equalTo('00');
          done();
        });

        test('ff + ff => fe', done => {
          assert.that(hex.add('ff', 'ff')).is.equalTo('fe');
          done();
        });
      });
    });
  });
});
