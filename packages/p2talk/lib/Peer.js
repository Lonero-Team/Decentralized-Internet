'use strict';

const path = require('path'),
    url = require('url'),
    util = require('util');

const bodyParser = require('body-parser'),
    eventEmitter2 = require('eventemitter2'),
    express = require('express'),
    flaschenpost = require('flaschenpost'),
    request = require('request'),
    requireAll = require('require-all'),
    sha1 = require('sha1');

const Endpoint = require('./Endpoint'),
    errors = require('./errors'),
    interval = require('./interval'),
    WellKnownPeers = require('./WellKnownPeers');

const EventEmitter2 = eventEmitter2.EventEmitter2;

const routes = requireAll(path.join(__dirname, 'routes'));

const logger = flaschenpost.getLogger();

const Peer = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }

  EventEmitter2.call(this, {
    wildcard: true,
    delimiter: '::'
  });

  this.protocol = options.protocol || 'https';
  this.self = new Endpoint(options);
  this.metadata = options.metadata || {};

  this.successor = new Endpoint(options);
  this.predecessor = new Endpoint(options);
  this.successors = [];
  this.fingers = [];

  this.wellKnownPeers = new WellKnownPeers();
  this.wellKnownPeers.add(this.self);
  this.wellKnownPeers.add(options.wellKnownPeers || []);

  this.handle = {};

  this.app = express();

  this.app.use(bodyParser.json());

  this.app.post('/self', routes.self(this));
  this.app.post('/status', routes.status(this));
  this.app.post('/metadata', routes.metadata(this));

  this.app.post('/successor', routes.successor(this));
  this.app.post('/successors', routes.successors(this));
  this.app.post('/predecessor', routes.predecessor(this));

  this.app.post('/closest-preceding-finger', routes.closestPrecedingFinger(this));
  this.app.post('/find-predecessor', routes.findPredecessor(this));
  this.app.post('/find-successor', routes.findSuccessor(this));

  this.app.post('/join', routes.join(this));

  this.app.post('/notify', routes.notify(this));
  this.app.post('/stabilize', routes.stabilize(this));
  this.app.post('/fix-fingers', routes.fixFingers(this));
  this.app.post('/fix-successors', routes.fixSuccessors(this));
  this.app.post('/fix-predecessor', routes.fixPredecessor(this));

  this.app.post('/handle/:action', routes.handle(this));
};

util.inherits(Peer, EventEmitter2);

Peer.prototype.remote = function (target) {
  if (!target) {
    throw new Error('Target is missing.');
  }
  if (!target.host) {
    throw new Error('Host is missing.');
  }
  if (!target.port) {
    throw new Error('Port is missing.');
  }

  return {
    run: (fn, args, callback) => {
      if (!fn) {
        throw new Error('Function is missing.');
      }
      if (!args) {
        throw new Error('Callback is missing.');
      }
      if (!callback) {
        callback = args;
        args = {};
      }

      const targetAsUrl = url.format({
        protocol: this.protocol,
        hostname: target.host,
        port: target.port,
        pathname: fn
      });

      request.post(targetAsUrl, {
        body: args,
        json: true,
        keepAlive: true
      }, (err, res, body) => {
        if (err) {
          return callback(err);
        }

        res.resume();

        if (res.statusCode !== 200) {
          const errorSummary = {
            url: targetAsUrl,
            args,
            statusCode: res.statusCode,
            body: (body || '').trim('\n')
          };

          logger.warn('Failed to call a remote function.', errorSummary);
          return callback(new errors.UnexpectedStatusCode(`Unexpected status code ${res.statusCode} when running ${fn}.`, errorSummary));
        }

        callback(null, body);
      });
    }
  };
};

Peer.prototype.setSuccessor = function (successor) {
  if (!successor) {
    throw new Error('Successor is missing.');
  }

  const fromStatus = this.status();

  this.successor = new Endpoint({
    host: successor.host,
    port: successor.port
  });
  this.emit('environment::successor', this.successor);

  const toStatus = this.status();

  if (toStatus !== fromStatus) {
    this.emit(`status::${toStatus}`, {
      from: fromStatus,
      to: toStatus
    });
  }
};

Peer.prototype.setPredecessor = function (predecessor) {
  const fromStatus = this.status();

  if (predecessor) {
    this.predecessor = new Endpoint({
      host: predecessor.host,
      port: predecessor.port
    });
  } else {
    this.predecessor = undefined;
  }
  this.emit('environment::predecessor', this.predecessor);

  const toStatus = this.status();

  if (toStatus !== fromStatus) {
    this.emit(`status::${toStatus}`, {
      from: fromStatus,
      to: toStatus
    });
  }
};

Peer.prototype.status = function () {
  if (!this.predecessor) {
    return 'unbalanced';
  }

  if ((this.self.id === this.successor.id) && (this.self.id === this.predecessor.id)) {
    return 'lonely';
  }

  if ((this.self.id !== this.successor.id) && (this.self.id !== this.predecessor.id)) {
    return 'joined';
  }

  return 'unbalanced';
};

Peer.prototype.fixSuccessor = function () {
  this.successors.shift();

  if (this.successors.length === 0) {
    return this.setSuccessor({
      host: this.self.host,
      port: this.self.port
    });
  }

  this.setSuccessor({
    host: this.successors[0].host,
    port: this.successors[0].port
  });
};

Peer.prototype.getEndpointFor = function (value, callback) {
  if (!value) {
    throw new Error('Value is missing.');
  }
  if (!callback) {
    throw new Error('Callback is missing.');
  }

  this.remote(this.self).run('find-successor', {
    id: sha1(value)
  }, (errFindSuccessor, successor) => {
    if (errFindSuccessor) {
      return callback(errFindSuccessor);
    }

    this.remote(successor).run('metadata', (errMetadata, metadata) => {
      if (errMetadata) {
        return callback(errMetadata);
      }

      callback(null, successor, metadata);
    });
  });
};

Peer.prototype.isResponsibleFor = function (value) {
  if (!value) {
    throw new Error('Value is missing.');
  }
  if (!this.predecessor) {
    return false;
  }

  const id = sha1(value);

  return interval({
    left: this.predecessor.id,
    right: this.self.id,
    type: 'leftopen'
  }).contains(id);
};

module.exports = Peer;
