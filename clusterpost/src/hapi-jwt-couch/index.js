exports.plugin = {};
exports.plugin.register = async function (server, conf) {

  require('./jwtauth.routes')(server, conf);
};

exports.plugin.pkg = require('./package.json');