'use strict';

const url = require('url');

const flaschenpost = require('flaschenpost'),
    processEnv = require('processenv'),
    request = require('request'),
    uuid = require('uuidv4');

const logger = flaschenpost.getLogger();

const port = processEnv('PORT') || 3000;

const job = {
  id: process.argv[2] || uuid(),
  data: process.argv[3] || 'foo'
};

request.post(url.format({
  protocol: 'http',
  hostname: 'localhost',
  port,
  pathname: '/job'
}), {
  body: { value: job.id, data: job.data },
  json: true
}, (err, res) => {
  if (err || (res.statusCode !== 200)) {
    logger.fatal('Failed to send job.', err);
    /* eslint-disable no-process-exit */
    process.exit(1);
    /* eslint-enable no-process-exit */
  }

  const target = res.body.endpoint;

  logger.info(`Sent job ${job.id} to ${target.host}:${target.port}.`, { job, target });
});
