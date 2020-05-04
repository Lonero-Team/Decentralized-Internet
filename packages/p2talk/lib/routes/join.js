'use strict';

const join = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const host = req.body.host,
        port = req.body.port;

    if (!host) {
      return res.sendStatus(400);
    }
    if (!port) {
      return res.sendStatus(400);
    }

    if (host === peer.self.host && port === peer.self.port) {
      return res.sendStatus(200);
    }
    if (peer.status() !== 'lonely') {
      return res.sendStatus(200);
    }

    peer.remote({ host, port }).run('find-successor', { id: peer.self.id }, (err, successor) => {
      if (err) {
        return res.sendStatus(500);
      }

      peer.setPredecessor(undefined);
      peer.setSuccessor(successor);

      res.sendStatus(200);
    });
  };
};

module.exports = join;
