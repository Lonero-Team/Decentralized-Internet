var Hapi = require('@hapi/hapi');
var fs = require('fs');
var good = require('@hapi/good');
var path = require('path');
var _ = require('underscore');

var env = process.env.NODE_ENV;

if(!env) throw "Please set NODE_ENV variable.";


const getConfigFile = function () {
  try {
    // Try to load the user's personal configuration file
    return require(process.cwd() + '/conf.my.' + env + '.json');
  } catch (e) {
    // Else, read the default configuration file
    return require(process.cwd() + '/conf.' + env + '.json');
  }
}

const startServer = async (cluster) => {

    var conf = getConfigFile();

    var tls;
    if(conf.tls && conf.tls.key && conf.tls.cert){
        tls = {
          key: fs.readFileSync(conf.tls.key),
          cert: fs.readFileSync(conf.tls.cert)
        };
    }
    var server_options = { 
        host: conf.host,
        port: conf.port,
        tls: tls
    }
    if(process.env.NODE_ENV == 'test'){
        server_options.routes = {
            "cors": true
        }
    }
    var server = new Hapi.Server(server_options);    

    var plugins = _.map(conf.plugins, function(options, pluginName){
            return {
                plugin: require(pluginName), 
                options: options
            }
        });

    plugins.push({
        plugin: good,
        options: {
            reporters: {
                myConsoleReporter: [{
                    module: '@hapi/good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*' }]
                },
                {
                    module: '@hapi/good-console'
                }, 'stdout'],
                myFileReporter: [{
                    module: '@hapi/good-squeeze',
                    name: 'Squeeze',
                    args: [{ ops: '*' }]
                }, {
                    module: '@hapi/good-squeeze',
                    name: 'SafeJson'
                }]
            }
        }
    });

    
    server.method({
        name: 'getCluster',
        method: function(){
            return cluster;
        },
        options: {}
    });
    
    await server.register(plugins);
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);

}

if(env === 'production'){
    const cluster = require('cluster');
    const numCPUs = require('os').cpus().length;

    if (cluster.isMaster) {
      // Fork workers.
      for (var i = 0; i < 1; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log("worker ", worker.process.pid,"died");
      });
      
    } else {
        startServer(cluster);
    }
}else{

    startServer();
}
