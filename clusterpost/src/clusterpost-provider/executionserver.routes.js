module.exports = function (server, conf) {

	var handlers = require('./executionserver.handlers')(server, conf);
	var Joi = require('@hapi/joi');
	var clustermodel = require('clusterpost-model');
	

	server.route({
		method: 'GET',
		path: "/executionserver",
		config: {
			auth: {
				strategy: 'token',
				scope: ['clusterpost']
			},
			handler: handlers.getExecutionServers,
			response: {
				schema: Joi.array().items(Joi.object().keys({
					name: Joi.string(),
					queues: Joi.array().items(Joi.string()).optional(),
					info: Joi.object().optional()
				}))
			},
			description: 'Get execution servers code names'
	    }
	});

	server.route({
		method: 'POST',
		path: "/executionserver/{id}",
		config: {
			auth: {
				strategy: 'token',
				scope: ['clusterpost']
			},
			handler: handlers.submitJob,
			validate: {
				params: {
					id: Joi.string().alphanum().required()
				},
				query: false,
				payload: Joi.object().keys({
					force: Joi.boolean()
				}).optional()
			},
			description: 'Start job execution'
		}
	});

	server.route({
		method: 'DELETE',
		path: "/executionserver/{id}",
		config: {
			auth: {
				strategy: 'token',
				scope: ['clusterpost']
			},
	      handler: handlers.killJob,
	      validate: {
	      	params: {
	      		id: Joi.string().alphanum().required()
	      	},
	      	query: false,
	      	payload: false
	      },
	      description: 'Kill a running job'
	    }
	});

	server.route({
		method: 'GET',
		path: "/executionserver/{id}",
		config: {
			auth: {
				strategy: 'token',
				scope: ['clusterpost']
			},
			handler: handlers.jobStatus,
			validate:{
				params: {
					id: Joi.string().alphanum().required()
				},
				query: false,
				payload: false
			},
			description: 'Update job status'
		}
	});

	server.route({
		method: 'GET',
		path: "/executionserver/deletequeue",
		config: {
			auth: {
				strategy: 'token',
				scope: ['clusterpost', 'executionserver']
			},
			handler: handlers.getDeleteQueue,
			validate:{
				params: null,
				query: false,
				payload: false
			},
			response: {
				schema: Joi.array().items(clustermodel.job)
			},
			description: 'Get delete queue for remote execution server'
		}
	});

	server.route({
		method: 'GET',
		path: "/executionserver/tokens",
		config: {
			auth: {
				strategy: 'token',
				scope: ['admin']
			},
			handler: handlers.getExecutionServerTokens,
			validate:{
				params: null,
				query: Joi.object().keys({
			  		executionserver: Joi.string()
			  	}).optional(),
				payload: false
			},
			response: {
				schema: Joi.array().items(clustermodel.executionservertoken)
			},
			description: 'Get tokens for the remote execution servers'
		}
	});
}

