exports.plugin = {};
exports.plugin.register = async function (server, conf) {
  
  require('./dataprovider.routes')(server, conf);
  require('./executionserver.routes')(server, conf);
  require('./clusterprovider.methods')(server, conf);
  require('./cronprovider')(server, conf);

  var cluster = server.methods.getCluster();
  if(!cluster || cluster && cluster.worker.id === 1){
    
    server.methods.executionserver.startExecutionServers()
    .then(function(){
        return server.methods.executionserver.startTunnels();
    })
    .then(function(){
      console.log("Execution servers started.");
    });
  }

};

exports.plugin.pkg = require('./package.json');
