'use strict';

const fs = require('fs'),
    path = require('path');

const p2p = require('../../lib/p2p');

/* eslint-disable no-process-env  */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/* eslint-enable no-process-env  */

p2p.peer({
  /* eslint-disable no-process-env */
  host: process.env.HOST,
  port: process.env.PORT,
  privateKey: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'privateKey.pem')),
  certificate: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'localhost.selfsigned', 'certificate.pem')),
  serviceInterval: process.env.SERVICE_INTERVAL
  /* eslint-enable no-process-env */
});
