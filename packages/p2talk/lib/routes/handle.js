'use strict';

const handle = function (peer) {
  if (!peer) {
    throw new Error('Peer is missing.');
  }

  return (req, res) => {
    const action = req.params.action;

    if (!peer.handle[action]) {
      return res.sendStatus(404);
    }

    peer.handle[action](req.body, (err, result) => {
      if (err) {
        return res.sendStatus(500);
      }
      return res.send(result || {});
    });
  };
};

module.exports = handle;
