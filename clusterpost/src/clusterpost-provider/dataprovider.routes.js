
module.exports = function (server, conf) {
	
	var handlers = require('./dataprovider.handlers')(server, conf);
	var Joi = require('@hapi/joi');

	var clustermodel = require('clusterpost-model');

	server.route({
		path: '/dataprovider',
		method: 'POST',
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.createJob,
			validate: {
				query: false,
		        payload: clustermodel.jobpost,
		        params: null
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to post job documents to the couch database.'
		}
	});

	server.route({
		path: '/dataprovider/{id}',
		method: 'DELETE',
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost']
            },
			handler: handlers.deleteJob,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required()
			    }, 
			    payload: false
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to delete job documents from the database'
		}
	});

	server.route({
		path: '/dataprovider',
		method: 'PUT',
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.updateJob,
			validate: {
				query: false,
		        payload: clustermodel.job,
		        params: null
			},
			payload:{
				output: 'data'
			},
			description: 'This route will be used to update a job document in the couch database.'
		}
	});

	server.route({
		method: 'PUT',
		path: "/dataprovider/{id}/{name}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.addData,
	      	validate: {
		      	query: false,
		        params: {
		        	id: Joi.string().alphanum().required(),
		        	name: Joi.string().required()
		        },
		        payload: true
		    },
		    payload: {
	        	maxBytes: 1024 * 1024 * 1024,
	    		output: 'stream'
	        },
	        response: {
	        	schema: Joi.object()
	        },
		    description: 'Add attachment data'
	    }
	});
	

	server.route({
		method: 'GET',
		path: "/dataprovider/{id}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.getJob,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required()
			    }, 
			    payload: false
			},
			response: {
				schema: clustermodel.job
			},
			description: 'Get the job document posted to the database'
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider",
		config: {
			auth: {
                strategy: 'token',
                scope: ['admin']
            },
			handler: handlers.getAllJobs,
			validate: {
			  	query: Joi.object().keys({
			  		executable: Joi.string().optional()
			  	}).optional(),
			    params: null, 
			    payload: false
			},
			response: {
				schema: Joi.array().items(clustermodel.job).min(0)
			},
			description: 'Get all document posted to the database'
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/count",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost']
            },
			handler: handlers.getJobCount,
			validate: {
			  	query: false,
			    params: null, 
			    payload: false
			},
			response: {
				schema: true
			},
			description: 'Get all document posted to the database'
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/user",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.getUserJobs,
			validate: {
			  	query: Joi.object().keys({
			  		userEmail: Joi.string().email().optional(),
			  		jobstatus: Joi.string().optional(),
			  		executable: Joi.string().optional(),
			  		executionserver: Joi.string().optional()
			  	}), 
			  	params: null
			},
			response: {
				schema: Joi.array().items(clustermodel.job).min(0)
			},
			description: 'Get the jobs posted to the database for a user.'
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/{id}/{name}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.getJob,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required(),
			    	name: Joi.string().required()
			    },
			    payload: false
			},
			description: 'Get a specific attachment of the document posted to the database.',
			cache : { expiresIn: 60 * 30 * 1000 }
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/download/{id}/{name}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.getDownloadToken,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required(),
			    	name: Joi.string().required()
			    },
			    payload: false
			},
			description: 'Get a temporary token to download an attachment from a job. This is useful when you want to download a file in a separate window. The query parameter expiresIn is expressed in seconds or a string describing a time span. Eg: 60, "2 days", "10h", "7d"',
			response: {
				schema: Joi.object().keys({
					token: Joi.string().required()
				})
			}
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/download/job/{id}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.getDownload,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().required()
			    },
			    payload: false
			},
			description: 'Download job in a tar file'
	    }
	});

	server.route({
		method: 'DELETE',
		path: "/dataprovider/download/job/{id}",
		config: {
			auth: {
                strategy: 'token',
                scope: ['clusterpost', 'executionserver']
            },
			handler: handlers.deleteDownload,
			validate: {
			  	query: false,
			    params: {
			    	id: Joi.string().alphanum().required()
			    },
			    payload: false
			},
			description: 'Delete the tar file in temp folder',
			response: {
				schema: true
			}
	    }
	});

	server.route({
		method: 'GET',
		path: "/dataprovider/download/{token}",
		config: {
			handler: handlers.downloadAttachment,
			validate: {
			  	query: false,
			    params: {
			    	token: Joi.string().required()
			    },
			    payload: false
			},
			description: 'Get an attachment using a temporary token',
			cache : { expiresIn: 60 * 30 * 1000 }
	    }
	});

}
