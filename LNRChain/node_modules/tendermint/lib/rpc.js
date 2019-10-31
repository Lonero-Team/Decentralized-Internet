'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');
var axios = require('axios');
var url = require('url');
var old = require('old');
var camel = require('camelcase');
var websocket = require('websocket-stream');
var ndjson = require('ndjson');
var pumpify = require('pumpify').obj;
var debug = require('debug')('tendermint:rpc');
var tendermintMethods = require('./methods.js');

function convertHttpArgs(args) {
  args = args || {};
  for (var k in args) {
    var v = args[k];
    if (typeof v === 'number') {
      args[k] = '"' + v + '"';
    }
  }
  return args;
}

function convertWsArgs(args) {
  args = args || {};
  for (var k in args) {
    var v = args[k];
    if (typeof v === 'number') {
      args[k] = String(v);
    } else if (Buffer.isBuffer(v)) {
      args[k] = '0x' + v.toString('hex');
    } else if (v instanceof Uint8Array) {
      args[k] = '0x' + Buffer.from(v).toString('hex');
    }
  }
  return args;
}

var wsProtocols = ['ws:', 'wss:'];
var httpProtocols = ['http:', 'https:'];
var allProtocols = wsProtocols.concat(httpProtocols);

var Client = function (_EventEmitter) {
  _inherits(Client, _EventEmitter);

  function Client() {
    var uriString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'localhost:26657';

    _classCallCheck(this, Client);

    // parse full-node URI
    var _this = _possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this));

    var _url$parse = url.parse(uriString),
        protocol = _url$parse.protocol,
        hostname = _url$parse.hostname,
        port = _url$parse.port;

    // default to http


    if (!allProtocols.includes(protocol)) {
      var uri = url.parse('http://' + uriString);
      protocol = uri.protocol;
      hostname = uri.hostname;
      port = uri.port;
    }

    // default port
    if (!port) {
      port = 26657;
    }

    if (wsProtocols.includes(protocol)) {
      _this.websocket = true;
      _this.uri = protocol + '//' + hostname + ':' + port + '/websocket';
      _this.call = _this.callWs;
      _this.connectWs();
    } else if (httpProtocols.includes(protocol)) {
      _this.uri = protocol + '//' + hostname + ':' + port + '/';
      _this.call = _this.callHttp;
    }
    return _this;
  }

  _createClass(Client, [{
    key: 'connectWs',
    value: function connectWs() {
      var _this2 = this;

      this.ws = pumpify(ndjson.stringify(), websocket(this.uri));
      this.ws.on('error', function (err) {
        return _this2.emit('error', err);
      });
      this.ws.on('close', function () {
        if (_this2.closed) return;
        _this2.emit('error', Error('websocket disconnected'));
      });
      this.ws.on('data', function (data) {
        data = JSON.parse(data);
        if (!data.id) return;
        _this2.emit(data.id, data.error, data.result);
      });
    }
  }, {
    key: 'callHttp',
    value: function callHttp(method, args) {
      return axios({
        url: this.uri + method,
        params: convertHttpArgs(args)
      }).then(function (_ref) {
        var data = _ref.data;

        if (data.error) {
          var err = Error(data.error.message);
          Object.assign(err, data.error);
          throw err;
        }
        return data.result;
      }, function (err) {
        throw Error(err);
      });
    }
  }, {
    key: 'callWs',
    value: function callWs(method, args, listener) {
      var _this3 = this;

      var self = this;
      return new Promise(function (resolve, reject) {
        var id = Math.random().toString(36);
        var params = convertWsArgs(args);

        if (method === 'subscribe') {
          if (typeof listener !== 'function') {
            throw Error('Must provide listener function');
          }

          // events get passed to listener
          _this3.on(id + '#event', function (err, res) {
            if (err) return self.emit('error', err);
            listener(res.data.value);
          });

          // promise resolves on successful subscription or error
          _this3.on(id, function (err) {
            if (err) return reject(err);
            resolve();
          });
        } else {
          // response goes to promise
          _this3.once(id, function (err, res) {
            if (err) return reject(err);
            resolve(res);
          });
        }

        _this3.ws.write({ jsonrpc: '2.0', id: id, method: method, params: params });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      this.closed = true;
      if (!this.ws) return;
      this.ws.destroy();
    }
  }]);

  return Client;
}(EventEmitter);

// add methods to Client class based on methods defined in './methods.js'


var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  var _loop = function _loop() {
    var name = _step.value;

    Client.prototype[camel(name)] = function (args, listener) {
      if (args) {
        debug('>>', name, args);
      } else {
        debug('>>', name);
      }
      return this.call(name, args, listener).then(function (res) {
        debug('<<', name, res);
        return res;
      });
    };
  };

  for (var _iterator = tendermintMethods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    _loop();
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

module.exports = old(Client);