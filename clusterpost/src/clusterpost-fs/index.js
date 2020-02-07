exports.plugin = {};
exports.plugin.register = async function (server, conf) {

  var _ = require('underscore');
  var fs = require('fs');
  var path = require('path');
  var Boom = require('boom');

  _.each(conf.links, function(dir, key){

    var currentpath = path.join(__dirname, key);

    try{
      fs.statSync(currentpath);
    }catch(e){
      try{
        fs.linkSync(dir, currentpath);
      }catch(e){
        console.error(e);
      }
    }
    
  });

  server.route({
    path: '/dataprovider-fs/{path*}',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
        scope: ['clusterpost', 'executionserver']
      },
      handler: {
        directory: { path: __dirname, listing: false, index: true }
      },
      description: 'This route serves static folder content for clusterpost. Everything inside this folder will be directly accessible under this route.'
    }
  });

};

exports.plugin.pkg = require('./package.json');
