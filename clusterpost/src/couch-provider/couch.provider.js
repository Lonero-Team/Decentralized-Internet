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
	if(fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()){
		_.map(fs.readdirSync(dirpath), function(filename){
			var fullpath = path.join(dirpath, filename);
			if(fs.existsSync(fullpath)){
				if(fs.statSync(fullpath).isDirectory()){
					exports.removeDirectorySync(fullpath);
				}else{
					fs.unlinkSync(fullpath);
				}
			}else{
				//Does not exists try to remove anyway, probably a dead symlink
				try{
					fs.unlinkSync(fullpath);
				}catch(e){
					console.error(e);
				}
			}
		});
		fs.rmdirSync(dirpath);
	}
}

exports.deleteDocument = function(doc, codename){
	if(doc.attachments){
		var conf = exports.getConfiguration(codename);
		var dirpath = path.join(conf.datapath, doc._id);
		if(dirpath === conf.datapath){
			throw "Something is terrible wrong with the doc._id";
		}
		exports.removeDirectorySync(dirpath);
	}

	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + doc._id,
				method: 'DELETE',
				qs: {
					rev: doc._rev
				}
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
					uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + name,
					method: 'DELETE',
					qs: {
						rev: doc._rev
					}
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
					uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + encodeURIComponent(name),
					method: 'PUT',
					headers: {
						"Content-type" : "application/octet-stream"
					},
					qs: {
						rev: doc._rev
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

exports.getDocumentStreamAttachmentUri = function(doc, name, codename){
	if(doc.attachments && doc.attachments[name]){

		var conf = exports.getConfiguration(codename);

		var filepath = path.join(conf.datapath, doc._id, name);

		if(!fs.existsSync(filepath)){
			throw "File not found";
		}
		return Promise.resolve({file: filepath});
	}else if(doc._attachments && doc._attachments[name]){
		return Promise.resolve({uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + name});
	}else{
		return Promise.reject("Document is missing attachment");
	}
}

exports.getDocumentStreamAttachment = function(doc, name, codename){
	return exports.getDocumentStreamAttachmentUri(doc, name, codename)
	.then(function(uri){
		if(uri.file){
			return Promise.resolve(fs.createReadStream(uri.file));
		}else if(uri.uri){
			var pass = new PassThrough();
			request(uri).pipe(pass);
			return Promise.resolve(pass);
		}else{
			return Promise.reject("Document is missing attachment");
		}
	})
}

exports.getDocumentAttachment = function(doc, name, codename){
	return new Promise(function(resolve, reject){
		return exports.getDocumentStreamAttachment(doc, name, codename)
		.then(function(stream){
			var concatStream = concat(resolve);
			stream.pipe(concatStream);
			stream.on('error', reject);
		})
		.catch(reject);	
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

exports.getViewQs = function(view, query, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + view,
				qs: query
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