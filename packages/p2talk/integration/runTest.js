'use strict';

const path = require('path');

const parse = require('parse-duration');

const algorithms = require('./algorithms'),
    configuration = require('./configuration.json');

const runTest = function (testName, callback) {
  testName = path.basename(testName, '.js');

  const ringSizes = algorithms[configuration.ringSizes.algorithm](configuration.ringSizes.iterations);

  ringSizes.forEach(ringSize => {
    const individualConfiguration = {
      serviceInterval: configuration.serviceInterval,
      ringSize,
      timeout: configuration.timeout
    };

    const testFunction = callback(individualConfiguration);

    suite(testName, function () {
      /* eslint-disable no-process-env  */
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      /* eslint-enable no-process-env  */

      this.timeout(parse(configuration.timeout));
      test('ringSize ' + ringSize, testFunction);
    });
  });
};

module.exports = runTest;
