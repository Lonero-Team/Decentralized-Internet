var Hapi = require('hapi');

const getConfigFile = function () {
  try {
    // Try to load the user's personal configuration file
    return require(process.cwd() + '/conf.my.test.json');
  } catch (e) {
    // Else, read the default configuration file
    return require(process.cwd() + '/conf.test.json');
  }
}
var conf = getConfigFile();

var server = new Hapi.Server();

server.connection({ 
    host: conf.host,
    port: conf.port
});

var plugins = [];

Object.keys(conf.plugins).forEach(function(pluginName){
    var plugin = {};
    plugin.register = require(pluginName);
    plugin.options = conf.plugins[pluginName];
    plugins.push(plugin);
});

server.register(plugins, function(err){
    if (err) {
        throw err; // something bad happened loading the plugin
    }

});

server.start(function () {
    server.connections.forEach(function(connection){
        console.log('info', 'server is listening port: ' + connection.info.uri);
    });
});