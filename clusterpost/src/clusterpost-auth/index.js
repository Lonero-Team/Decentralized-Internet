var Boom = require('boom');
var Promise = require('bluebird');

exports.register = function (server, conf, next) {

	const validate = function(req, decodedToken, callback){
        var exs = server.methods.executionserver.getExecutionServer(decodedToken.executionserver);
		if(exs){
			exs.scope = ['executionserver'];
			callback(undefined, true, exs);
		}else{
			callback(Boom.unauthorized(exs));
		}
	}

	conf.validate = validate;

	server.register({
		register: require('hapi-jwt-couch'),
		options: conf
	}, function(err){

		if(err){
			throw err;
		}

		server.method({
			name: 'clusterpostauth.verify',
			method: function(token){				
				return Promise.resolve(server.methods.jwtauth.verify(token));
			},
			options: {}
		});

	});
	
	return next();
	
};

exports.register.attributes = {
  pkg: require('./package.json')
};