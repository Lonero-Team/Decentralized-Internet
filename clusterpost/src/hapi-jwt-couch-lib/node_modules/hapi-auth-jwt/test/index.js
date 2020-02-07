// Load modules

var Boom = require('boom');
var Code = require('code');
var Hapi = require('hapi');
var Jwt  = require('jsonwebtoken');
var Lab  = require('lab');


// Test shortcuts

var lab = exports.lab = Lab.script();
var before = lab.before;
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('Token', function () {
  var privateKey = 'PajeH0mz4of85T9FB1oFzaB39lbNLbDbtCQ';

  var tokenHeader = function (username, options) {
    options = options || {};

    return 'Bearer ' + Jwt.sign({username : username}, privateKey, options);
  };

  var loadUser = function (request, decodedToken, callback) {
    var username = decodedToken.username;

    if (username === 'john') {
      return callback(null, true, {
        user: 'john',
        scope: ['a']
      });
    } else if (username === 'jane') {
      return callback(Boom.badImplementation());
    } else if (username === 'invalid1') {
      return callback(null, true, 'bad');
    } else if (username === 'nullman') {
      return callback(null, true, null);
    }

    return callback(null, false);
  };

  var tokenHandler = function (request, reply) {

    reply('ok');
  };

  var doubleHandler = function (request, reply) {

    var options = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john') }, credentials: request.auth.credentials };

    server.inject(options, function (res) {

      reply(res.result);
    });
  };

  var server = new Hapi.Server({ debug: false });
  server.connection();

  before(function (done) {

    server.register(require('../'), function (err) {

      expect(err).to.not.exist;
      server.auth.strategy('default', 'jwt', 'required', { key: privateKey,  validateFunc: loadUser });

      server.route([
        { method: 'POST', path: '/token', handler: tokenHandler, config: { auth: 'default' } },
        { method: 'POST', path: '/tokenOptional', handler: tokenHandler, config: { auth: { mode: 'optional' } } },
        { method: 'POST', path: '/tokenScope', handler: tokenHandler, config: { auth: { scope: 'x' } } },
        { method: 'POST', path: '/tokenArrayScope', handler: tokenHandler, config: { auth: { scope: ['x', 'y'] } } },
        { method: 'POST', path: '/tokenArrayScopeA', handler: tokenHandler, config: { auth: { scope: ['x', 'y', 'a'] } } },
        { method: 'POST', path: '/double', handler: doubleHandler }
      ]);

      done();
    });
  });

  it('returns a reply on successful auth', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.result).to.equal('ok');
      done();
    });
  });

  it('returns a reply on successful auth with audience (aud) and issuer (iss) as options', function (done) {

    var handler = function (request, reply) {
      expect(request.auth.isAuthenticated).to.equal(true);
      expect(request.auth.credentials).to.exist;
      reply('ok');
    };

    var s = new Hapi.Server({ debug: false });
    s.connection();
    s.register(require('../'), function (err) {
      expect(err).to.not.exist;

      s.auth.strategy('default', 'jwt', 'required', { key: privateKey, verifyOptions: { audience: 'urn:foo', issuer: 'urn:issuer' } });

      s.route([
        { method: 'POST', path: '/token', handler: handler, config: { auth: 'default' } }
      ]);
    });

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john', { audience: 'urn:foo', issuer: 'urn:issuer' }) } };

    s.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.result).to.equal('ok');
      done();
    });
  });

  it('returns a 401 unauthorized error when algorithm do not match', function (done) {

    var handler = function (request, reply) {
      reply('ok');
    };

    var s = new Hapi.Server({ debug: false });
    s.connection();
    s.register(require('../'), function (err) {
      expect(err).to.not.exist;

      s.auth.strategy('default', 'jwt', 'required', { key: privateKey, verifyOptions: { algorithms : ['HS512'] } });

      s.route([
        { method: 'POST', path: '/token', handler: handler, config: { auth: 'default' } }
      ]);
    });

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john', { algorithm : 'HS256' }) } };

    s.inject(request, function (res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('returns decoded token when no validation function is set', function (done) {

    var handler = function (request, reply) {
      expect(request.auth.isAuthenticated).to.equal(true);
      expect(request.auth.credentials).to.exist;
      reply('ok');
    };

    var server = new Hapi.Server({ debug: false });
    server.connection();
    server.register(require('../'), function (err) {
      expect(err).to.not.exist;

      server.auth.strategy('default', 'jwt', 'required', { key: privateKey });

      server.route([
        { method: 'POST', path: '/token', handler: handler, config: { auth: 'default' } }
      ]);
    });

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.result).to.equal('ok');
      done();
    });
  });

  it('returns an error on wrong scheme', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: 'Steve something' } };

    server.inject(request, function (res) {

      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('returns a reply on successful double auth', function (done) {

    var request = { method: 'POST', url: '/double', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.result).to.equal('ok');
      done();
    });
  });

  it('returns a reply on failed optional auth', function (done) {

    var request = { method: 'POST', url: '/tokenOptional' };

    server.inject(request, function (res) {

      expect(res.result).to.equal('ok');
      done();
    });
  });

  it('returns an error with expired token', function (done) {

    var tenMin = -600;
    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('john', { expiresIn : tenMin }) } };

    server.inject(request, function (res) {
      expect(res.result.message).to.equal('Expired token received for JSON Web Token validation');
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('returns an error with invalid token', function (done) {
    var token = tokenHeader('john') + '123456123123';

    var request = { method: 'POST', url: '/token', headers: { authorization: token } };

    server.inject(request, function (res) {
      expect(res.result.message).to.equal('Invalid signature received for JSON Web Token validation');
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('returns an error on bad header format', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: 'Bearer' } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(400);
      expect(res.result.isMissing).to.equal(undefined);
      done();
    });
  });

  it('returns an error on bad header format', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: 'bearer' } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(400);
      expect(res.result.isMissing).to.equal(undefined);
      done();
    });
  });

  it('returns an error on bad header internal syntax', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: 'bearer 123' } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(400);
      expect(res.result.isMissing).to.equal(undefined);
      done();
    });
  });

  it('returns an error on unknown user', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('doe') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(401);
      done();
    });
  });

  it('returns an error on internal user lookup error', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('jane') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(500);
      done();
    });
  });

  it('returns an error on non-object credentials error', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('invalid1') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(500);
      done();
    });
  });

  it('returns an error on null credentials error', function (done) {

    var request = { method: 'POST', url: '/token', headers: { authorization: tokenHeader('nullman') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(500);
      done();
    });
  });

  it('returns an error on insufficient scope', function (done) {

    var request = { method: 'POST', url: '/tokenScope', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('returns an error on insufficient scope specified as an array', function (done) {

    var request = { method: 'POST', url: '/tokenArrayScope', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(403);
      done();
    });
  });

  it('authenticates scope specified as an array', function (done) {

    var request = { method: 'POST', url: '/tokenArrayScopeA', headers: { authorization: tokenHeader('john') } };

    server.inject(request, function (res) {

      expect(res.result).to.exist;
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('cannot add a route that has payload validation required', function (done) {

    var fn = function () {

      server.route({ method: 'POST', path: '/tokenPayload', handler: tokenHandler, config: { auth: { mode: 'required', payload: 'required' } } });
    };

    expect(fn).to.throw(Error);
    done();
  });

});
