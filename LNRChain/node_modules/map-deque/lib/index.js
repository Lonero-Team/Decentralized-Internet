'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var old = require('old');

var MapDeque = function () {
  function MapDeque() {
    _classCallCheck(this, MapDeque);

    this.queue = [];
    this.map = {};
    this.length = 0;
  }

  _createClass(MapDeque, [{
    key: '_put',
    value: function _put(key, value, push) {
      key = this._convertKey(key);
      if (this.has(key)) {
        throw new Error('A value with the key "' + key + '" already exists');
      }
      this.map[key] = value;
      this.queue[push ? 'push' : 'unshift']({ key: key, value: value });
      this.length++;
      return this;
    }
  }, {
    key: 'push',
    value: function push(key, value) {
      return this._put(key, value, true);
    }
  }, {
    key: 'unshift',
    value: function unshift(key, value) {
      return this._put(key, value, false);
    }
  }, {
    key: '_remove',
    value: function _remove(shift, entry) {
      if (this.length === 0) return;

      var _queue = this.queue[shift ? 'shift' : 'pop']();

      var key = _queue.key;
      var value = _queue.value;

      delete this.map[key];
      this.length--;
      return entry ? { key: key, value: value } : value;
    }
  }, {
    key: 'shift',
    value: function shift(entry) {
      return this._remove(true, entry);
    }
  }, {
    key: 'pop',
    value: function pop(entry) {
      return this._remove(false, entry);
    }
  }, {
    key: 'has',
    value: function has(key) {
      key = this._convertKey(key);
      return this.map.hasOwnProperty(key);
    }
  }, {
    key: 'get',
    value: function get(key) {
      key = this._convertKey(key);
      return this.map[key];
    }
  }, {
    key: '_convertKey',
    value: function _convertKey(key) {
      return key + '';
    }
  }]);

  return MapDeque;
}();

module.exports = old(MapDeque);