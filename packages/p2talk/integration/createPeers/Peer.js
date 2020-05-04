'use strict';

const knock = require('knockat');

const getDockWorker = require('./getDockWorker'),
    getId = require('../../lib/getId'),
    remote = require('../../lib/remote');

const Application = function (options) {
  this.containerName = undefined;

  this.id = undefined;
  this.port = options.port;
  this.serviceInterval = options.serviceInterval;
};

Application.prototype.start = function (callback) {
  getDockWorker((errGetDockWorker, dockWorker) => {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    const containerName = 'thenativeweb-p2p-test-' + this.port;

    dockWorker.startContainer({
      image: 'thenativeweb/p2p-test',
      name: containerName,
      env: {
        HOST: dockWorker.options.host,
        PORT: this.port,
        SERVICE_INTERVAL: this.serviceInterval
      },
      ports: [
        { container: this.port, host: this.port }
      ]
    }, errStart => {
      if (errStart) {
        return callback(errStart);
      }

      this.containerName = containerName;
      this.id = getId(dockWorker.options.host + ':' + this.port);

      knock.at(dockWorker.options.host, this.port, callback);
    });
  });
};

Application.prototype.join = function (target, callback) {
  getDockWorker((errGetDockWorker, dockWorker) => {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    remote(dockWorker.options.host, target.port).run('self', (errTargetSelf, targetSelf) => {
      if (errTargetSelf) {
        return callback(errTargetSelf);
      }

      remote(dockWorker.options.host, this.port).run('join', targetSelf, callback);
    });
  });
};

Application.prototype.stop = function (callback) {
  getDockWorker((errGetDockWorker, dockWorker) => {
    if (errGetDockWorker) {
      return callback(errGetDockWorker);
    }

    dockWorker.stopContainer(this.containerName, err => {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  });
};

[
  'self',
  'successor',
  'predecessor',
  'status'
].forEach(fn => {
  Application.prototype[fn] = function (callback) {
    getDockWorker((errGetDockWorker, dockWorker) => {
      if (errGetDockWorker) {
        return callback(errGetDockWorker);
      }

      remote(dockWorker.options.host, this.port).run(fn, callback);
    });
  };
});

module.exports = Application;
