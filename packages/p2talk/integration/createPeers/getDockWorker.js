'use strict';

const fs = require('fs'),
    path = require('path'),
    url = require('url');

const crew = require('crew');

let instance;

const getDockWorker = function (callback) {
  if (instance) {
    return process.nextTick(() => {
      callback(null, instance);
    });
  }

  crew({
    /* eslint-disable no-process-env */
    host: url.parse(process.env.DOCKER_HOST).hostname,
    port: url.parse(process.env.DOCKER_HOST).port,
    keys: {
      privateKey: fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'key.pem')),
      certificate: fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'cert.pem')),
      caCertificate: fs.readFileSync(path.join(process.env.DOCKER_CERT_PATH, 'ca.pem'))
    }
    /* eslint-enable no-process-env */
  }, (errCrew, dockWorker) => {
    if (errCrew) {
      return callback(errCrew);
    }

    dockWorker.ping(errPing => {
      if (errPing) {
        return callback(errPing);
      }

      instance = dockWorker;
      return callback(null, instance);
    });
  });
};

module.exports = getDockWorker;
