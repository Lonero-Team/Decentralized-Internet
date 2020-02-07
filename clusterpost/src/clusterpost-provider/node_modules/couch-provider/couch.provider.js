var request = require('request');
var _ = require('underscore');
var Promise = require('bluebird');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var concat = require('concat-stream');
const { PassThrough, Writable } = require('stream');

exports.configuration = {};

exports.setConfiguration = function(conf){
	if(!conf || !conf.default && !conf.hostname && !conf.database){
		var confexample = {
			"default": "codename",
			"codename" : {
				"hostname" : "http://localhost:5984",
				"database" : "db"
			}
		}
		console.error("No default database name, your conf should look like:", JSON.stringify(confexample, null, 2), "or", JSON.stringify(confexample.codename, null, 2))
		throw "Bad couchdb configuration";
	}
	exports.configuration = conf;
}

exports.createDB = function(codename){

	var url = exports.getCouchDBServer(codename);

    return new Promise(function(resolve, reject){
        request.put(url, function(err, res, body){
            if(err){
                reject(err.message);
            }else{
                try{
                    if(JSON.parse(body).error === "not_found"){
                        request.put(url, function(err, res, body){
                            resolve(JSON.parse(body));
                        });
                    }else{
                        resolve(JSON.parse(body));
                    }
                }catch(e){
                    console.error(url);
                    console.error(e);
                    reject(e);
                }
            }
        });
    });
}

exports.getConfiguration = function(codename){
	if(codename){
		return exports.configuration[codename];
	}else if(exports.configuration.default){
		return exports.configuration[exports.configuration.default];
	}else{
		return exports.configuration;
	}
}

exports.getCouchDBServer = function(codename){

	var conf = exports.getConfiguration(codename);

	if(!conf){
		throw "No couchdb server found in configuration with " + codename;
	}

	var url = conf.hostname + "/" + conf.database;

	return url;

}

exports.uploadDocuments = function(docs, codename){
	
	var alldocs = {};

	if(_.isArray(docs)){
		alldocs["docs"] = docs;
	}else if(_.isObject(docs)){
		alldocs["docs"] = [docs];
	}

    return new Promise(function(resolve, reject){
        var options = { 
            uri: exports.getCouchDBServer(codename) + "/_bulk_docs",
            method: 'POST', 
            json : alldocs
        };
        
        request(options, function(err, res, body){

            if(err){
            	reject({"id" : "uploadDocumentsDataProvider", "message" : err.message});
            }else if(body.error){
            	reject(body.error);
            }else{
            	resolve(body);
            }
        });
    });
}


exports.getDocument = function(id, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + id
			}
			request(options, function(err, res, body){
				if(err){
					reject(err);
				}else{
					var doc = JSON.parse(body);
					if(doc.error){
						reject(doc.error);
					}else{
						resolve(doc);
					}
				}
			});

		}catch(e){
			reject(e);
		}
	});
}

exports.mkdirp = function(path){
	return new Promise(function(resolve, reject){
		mkdirp(path, function(err){
			if(err){
				reject(err);
			}else{
				resolve(true);
			}
		});
	});
}

exports.removeDirectorySync = function(dirpath){
	try{
		if(fs.statSync(dirpath).isDirectory()){
			_.each(fs.readdirSync(dirpath), function(filename){
				var filename = path.join(dirpath, filename);
				var stats = fs.statSync(filename);
				if(stats.isFile()){
					fs.unlinkSync(filename);
				}else if(stats.isDirectory()){
					exports.removeDirectorySync(filename);
				}
			});
			fs.rmdirSync(dirpath);
		}else{
			throw "This is not a directory", dirpath;
		}
	}catch(e){
		console.error(e);
	}
}

exports.deleteDocument = function(doc, codename){
	if(doc.attachments){
		var conf = exports.getConfiguration(codename);
		var dirpath = path.join(conf.datapath, doc._id);
		exports.removeDirectorySync(dirpath);
	}

	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + doc._id + "?rev=" + doc._rev,
				method: 'DELETE'
			}				
			request(options, function(err, res, body){
				if(err){
					reject(err);
				}else{
					var doc = JSON.parse(body);
					if(doc.error){
						reject(doc);
					}else{
						resolve(doc);
					}
				}
			});

		}catch(e){
			reject(e);
		}
	});
}

exports.deleteAttachment = function(doc, name, codename){
	return new Promise(function(resolve, reject){

		if(doc.attachments && doc.attachments[name]){

			var conf = exports.getConfiguration(codename);
			var filepath = path.join(conf.datapath, doc.attachments[name].path);

			try{
				fs.unlinkSync(filepath);

				var docdir = path.normalize(path.join(conf.datapath, doc._id));

				while(path.normalize(filepath) !== docdir){
					filepath = path.dirname(filepath);
					if(fs.statSync(filepath).isDirectory() && fs.readdirSync(filepath).length === 0){
						fs.rmdirSync(filepath);
					}
				}

				delete doc.attachments[name];
				exports.uploadDocuments(doc, codename)
				.then(function(res){
					resolve(res);
				});
			}catch(e){
				reject(e);
			}

		}else if(doc._attachments && doc._attachments[name]){
			try{
				var options = {
					uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + name + "?rev=" + doc._rev,
					method: 'DELETE'
				}				
				request(options, function(err, res, body){
					if(err){
						reject(err);
					}else{
						var doc = JSON.parse(body);
						if(doc.error){
							reject(doc);
						}else{
							resolve(doc);
						}
					}
				});

			}catch(e){
				reject(e);
			}
		}else{
			throw "Attachement not found";
		}
	});
}

exports.addDocumentAttachment = function(doc, name, stream, codename){


	return new Promise(function(resolve, reject){

		var conf = exports.getConfiguration(codename);

		if(conf.datapath){
			var dirpath = path.join(conf.datapath, doc._id);
			var fullpath = path.join(dirpath, name);
			
			// The name may contain folders (name = dir1/dir2/actualfilename) so we need to create it recursively to be safe
			exports.mkdirp(path.dirname(fullpath))
			.then(function(){

				var filepath = path.join(doc._id, name);
				
				var writestream = fs.createWriteStream(fullpath);
				writestream.on('finish', function(err){

					if(!doc.attachments){
						doc.attachments = {};
					}

					doc.attachments[name] = {
			            "path": filepath
					}
					exports.uploadDocuments([doc], codename)
					.then(function(res){
						resolve(res[0]);
					})
					.catch(reject)

				})
				stream.pipe(writestream);
			});
			
		}else{
			try{
				var options = {
					uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + encodeURIComponent(name) + "?rev=" + doc._rev,
					method: 'PUT',
					headers: {
						"Content-type" : "application/octet-stream"
					}
				}
				stream.pipe(request(options, function(err, res, body){
					if(err){
						reject(err);
					}else{
						resolve(body);

					}
				}));
			}catch(e){
				reject(e);
			}
		}
		
	});
}

exports.getDocumentURIAttachment = function(doc, name, codename){

	console.error("THIS FUNCTION IS DEPRECATED, use getDocumentStreamAttachment to get a stream and pipe the data where ever you need.");

	if(doc.attachments && doc.attachments[name]){

		var conf = exports.getConfiguration(codename);

		var filepath = path.join(conf.datapath, doc._id, name);

		if(!fs.existsSync(filepath)){
			throw "File not found";
		}
		return {
		 	uri: exports.getCouchDBServer(codename) + "/" + doc._id,
		 	onResponse: function(err, res, request, reply, settings, ttl){//This is 'onResponse' for the h2o2 proxy for hapi https://github.com/hapijs/h2o2
	 			var stream = fs.createReadStream(filepath);
	 			reply(stream);
	 		}
		}
		
	}else{
		return {
			uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + name
		};
	}
}


exports.getDocumentStreamAttachment = function(doc, name, codename){

	if(doc.attachments && doc.attachments[name]){

		var conf = exports.getConfiguration(codename);

		var filepath = path.join(conf.datapath, doc._id, name);

		if(!fs.existsSync(filepath)){
			throw "File not found";
		}
		return fs.createReadStream(filepath);
	}else if(doc._attachments && doc._attachments[name]){
		var pass = new PassThrough();
		request({ uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + name }).pipe(pass);
		return pass;
	}else{
		console.error("Document is missing attachment");
		throw "Document is missing attachment";
	}
}

exports.getDocumentAttachment = function(doc, name, codename){

	return new Promise(function(resolve, reject){
		try{
			var stream = exports.getDocumentStreamAttachment(doc, name, codename);
			var concatStream = concat(resolve);
			stream.pipe(concatStream);
			stream.on('error', reject);
		}catch(e){
			reject(e);
		}
		
	});

}

exports.getView = function(view, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + view
			}

			request(options, function(err, res, body){					
				if(err){						
					reject(err);
				}else{
					var docs = JSON.parse(body);
					resolve(docs.rows);
				}					
			});
		}catch(e){
			reject(e);
		}
	})
}