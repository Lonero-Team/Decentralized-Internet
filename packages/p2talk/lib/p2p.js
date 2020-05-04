'use strict';

const http = require('http'),
    https = require('https');

const _ = require('lodash'),
    flaschenpost = require('flaschenpost'),
    parse = require('parse-duration'),
    Timer = require('timer2');

const Peer = require('./Peer');

const logger = flaschenpost.getLogger();

const p2p = {};

p2p.peer = function (options) {
  if (!options) {
    throw new Error('Options are missing.');
  }
  if (!options.privateKey && options.certificate) {
    throw new Error('Private key is missing.');
  }
  if (options.privateKey && !options.certificate) {
    throw new Error('Certificate is missing.');
  }

  const useHttps = !!options.privateKey && !!options.certificate;

  options.protocol = useHttps ? 'https' : 'http';

  const peer = new Peer(options);

  const serviceInterval = parse(options.serviceInterval || '30s'),
      wobbleFactor = serviceInterval * 0.5;

  if (useHttps) {
    https.createServer({
      key: options.privateKey,
      cert: options.certificate
    }, peer.app).listen(peer.self.port, () => {
      logger.info('Server started.', {
        endpoint: peer.self,
        status: peer.status()
      });
    });
  } else {
    http.createServer(peer.app).listen(peer.self.port, () => {
      logger.info('Server started.', {
        endpoint: peer.self,
        status: peer.status()
      });
    });
  }

  [ 'stabilize', 'fix-successors', 'fix-fingers', 'fix-predecessor' ].forEach(fn => {
    new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', () => {
      peer.remote(peer.self).run(fn, () => {});
    });
  });

  new Timer(serviceInterval, { variation: wobbleFactor }).on('tick', () => {
    peer.remote(peer.self).run('join', _.sample(peer.wellKnownPeers.get()), () => {});
  });

  return peer;
};

module.exports = p2p;
