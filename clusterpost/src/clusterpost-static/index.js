const fs = require('fs');
const path = require('path');

exports.plugin = {};
exports.plugin.register = async function (server, options) {
	server.path(__dirname);
	
	server.route({
		path: '/',
		method: '*',
		handler: function (request, reply) {
			return reply.redirect('/public');
		}
	});
	
	server.route({
		path: '/public/{path*}',
		method: 'GET',
		config: {
			handler: {
				directory: { path: './clusterpost-public/build', listing: false, index: true }
			},
			description: 'This route serves the static website of clusterpost.'
		}
	});
	
};

exports.plugin.pkg = require('./package.json');