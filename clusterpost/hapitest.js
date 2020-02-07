const Hapi = require('hapi');
const server = new Hapi.Server();
var fs= require('fs');
var path = require('path');


server.connection({ 
    host: 'localhost', 
    port: 8000 
	});
const getConfigFile = function (env, base_directory) {
  try {
    // Try to load the user's personal configuration file
    return require(base_directory + '/conf.my.' + env + '.json');
  } catch (e) {
    // Else, read the default configuration file
    return require(base_directory + '/conf.' + env + '.json');
  }
};


var env = process.env.NODE_ENV;
if(!env){ env = 'test' };

var conf = getConfigFile(env, "./");
console.log('conf',conf.testshinytooth.database);
server.register(
    [require('h2o2'),{ register: require('./index'), options: conf }]//This is loading couch-provider
, function (err) {

    if (err) {
        console.log('Failed to load h2o2');
    }
    server.route({
    method: 'GET',
    path: '/test/{docId}/{docName}',
    handler: function(request, reply){
    		// var route;
    		console.log('handler test server', request.params.docId);
    		var name = request.params.docName;
    		server.methods.couchprovider.getDocument(request.params.docId)
    		.then(function(doc){

    			var uri = server.methods.couchprovider.getDocumentURIAttachment(doc, name);
    			reply.proxy(uri);
    		});
    	}
    });

    server.start(function (err) {
        console.log('Server started at:'+ server.info.uri);
    });
});
 