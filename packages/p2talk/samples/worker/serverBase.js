'use strict';

const fs = require('fs'),
    http = require('http'),
    path = require('path');

const bodyParser = require('body-parser'),
    express = require('express'),
    flaschenpost = require('flaschenpost');

const p2p = require('../../lib/p2p');

const serverBase = {};

serverBase.run = function (options) {
  const logger = flaschenpost.getLogger();

  const certificate = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
      privateKey = fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'privateKey.pem'));

  /* eslint-disable no-process-env */
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  /* eslint-enable no-process-env */

  const peer = p2p.peer({
    host: 'localhost',
    port: options.p2p.port,
    privateKey,
    certificate,
    metadata: {
      host: 'localhost',
      port: options.http.port
    },
    wellKnownPeers: [
      { host: 'localhost', port: options.p2p.portJoin }
    ],
    serviceInterval: options.serviceInterval
  });

  peer.on('status::*', status => {
    logger.info('Changed status.', status);
  });

  peer.on('environment::successor', successor => {
    logger.info('Changed successor.', { successor });
  });

  peer.on('environment::predecessor', predecessor => {
    logger.info('Changed predecessor.', { predecessor });
  });

  peer.handle.process = function (payload, done) {
    logger.info('Processing job.', payload);
    done(null, {
      endpoint: peer.self
    });
  };

  const app = express();

  app.use(bodyParser.json());

  app.post('/job', (req, res) => {
    peer.getPeerFor(req.body.value, (errGetPeerFor, node) => {
      if (errGetPeerFor) {
        return res.sendStatus(500);
      }
      peer.remote(node).run('process', req.body, (err, result) => {
        if (err) {
          return res.sendStatus(500);
        }
        res.send(result);
      });
    });
  });

  http.createServer(app).listen(options.http.port);
};

module.exports = serverBase;
