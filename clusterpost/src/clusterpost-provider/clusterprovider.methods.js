var request = require('request');
var _ = require('underscore');
var Promise = require('bluebird');
var Stream = require('stream');
var Boom = require('boom');

module.exports = function (server, conf) {
	
	var clustermodel = require('clusterpost-model');
	var Joi = require('@hapi/joi');

	const isJobDocument = function(doc){
		Joi.assert(doc, clustermodel.job);
		return Promise.resolve(doc);
	}

	server.method({
	    name: 'clusterprovider.isJobDocument',
	    method: isJobDocument,
	    options: {}
	});

	const validateUserScopes = function(userscope, docscope){
		if(userscope && docscope){
			var intersection = _.intersection(userscope, docscope);
			return intersection.length > 0;
		}
		return false;
	}

	const validateJobOwnership = function(doc, credentials){
		return new Promise(function(resolve, reject){
			if(doc.userEmail === credentials.email || credentials.scope.indexOf('admin') >= 0 || (credentials.scope.indexOf("executionserver") >= 0) || validateUserScopes(credentials.scope, doc.scope)){
				resolve(doc);
			}else{
				reject(Boom.unauthorized("You are not allowed to access this job document!"));
			}
		});
	}

	server.method({
	    name: 'clusterprovider.validateJobOwnership',
	    method: validateJobOwnership,
	    options: {}
	});

	/*
	*   Download and save attachment from DB
	*   
	*/
	const downloadAttachment = function(options, filename){	    
	    Joi.assert(filename, Joi.string())
	    return new Promise(function(resolve, reject){

	        try{	            

	            var writestream = fs.createWriteStream(filename);
	            request(options).pipe(writestream);

	            writestream.on('finish', function(err){                 
	                if(err){
	                    reject({
	                        "path" : filename,
	                        "status" : false,
	                        "error": err
	                    });
	                }else{
	                    resolve({
	                        "path" : filename,
	                        "status" : true
	                    });
	                }
	            });

	        }catch(e){
	            reject(e);
	        }
	    });
	}

	server.method({
	    name: 'clusterprovider.downloadAttachment',
	    method: downloadAttachment,
	    options: {}
	});
}
