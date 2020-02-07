
module.exports = function (conf) {

	var fs = require('fs');
	var Promise = require('bluebird');
	var _ = require("underscore");
	var path = require("path");
	var tarGzip = require('node-targz');
	var Joi = require('@hapi/joi');
	var clustermodel = require('clusterpost-model');
	var clusterpost = require('clusterpost-lib');

	var agentOptions = {
		rejectUnauthorized: false
	}

	clusterpost.setClusterPostServer(conf.uri);
	clusterpost.setAgentOptions(agentOptions);
	clusterpost.setUserToken(conf.token);

	var handler = {};

	handler.getDataProvider = function(){

		var couchserver = conf.dataprovider;
		var url = couchserver.hostname;
		return url;

	}


	handler.uploadDocumentDataProvider = function(doc){
		return clusterpost.updateDocument(doc);
	}

	handler.getDocument = function(id){
		Joi.assert(id, Joi.string().alphanum());

		return clusterpost.getDocument(id)
		.then(function(job){
			Joi.assert(job, clustermodel.job);
			return job;
		});
	}

	handler.deleteDocument = function(doc){
		return clusterpost.deleteJob(doc._id);
	}

	//Read all files in directory and return an array with all files
	const getAllFiles = function(dir, files){		
		fs.readdirSync(dir).forEach(function(file){
			try{
				var current = path.join(dir, file);
				var stat = fs.statSync(current);
				if (stat && stat.isDirectory()) {
					getAllFiles(current, files);
				}else {
				    files.push(current);
				}
			}catch(e){
				console.error(e);
			}
        });
	}	

	handler.addDocumentDirectoryAttachment = function(doc, cwd, dir){
		var allfiles = [];
		getAllFiles(path.join(cwd, dir), allfiles);

		return Promise.map(allfiles, function(file){
			var name = file.substr(cwd.length + 1);			
			return handler.addDocumentAttachment(doc, name, file);
		}, {concurrency: 1})
		.then(function(status){
			var ok = true;
			_.each(status, function(s){
				ok = ok&&s.ok;
			});
			return {
				name: dir,
				status: status,
				ok: ok
			}
		});
	}

	handler.addDocumentAttachment = function(doc, name, path){
		Joi.assert(doc._id, Joi.string().alphanum());
		Joi.assert(name, Joi.string());

		return clusterpost.uploadFile(doc._id, path, name);
	}

	handler.fileExists = function(cwd, input){
		try{
			fs.statSync(path.join(cwd, input.name));
			return true;
		}catch(e){
			return false;
		}
	}
	

	handler.savePromise = function(doc, cwd, input){
		var inp = _.find(doc.inputs, function(inp){
			return inp.name === input.name;
		});

		if(!inp || (doc._attachments && !doc._attachments[input.name] && !inp.remote && !inp.local)){
			return Promise.reject({					
				"status" : false,
				"error": "Document is missing attachment" + input.name
			});
		}else{
			return clusterpost.getDocumentAttachmentSave(doc._id, input.name, path.join(cwd, input.name));
		}
	}


	handler.getAllDocumentInputs = function(doc, cwd){

		var inputs = doc.inputs;
		var alldownloads = [];
		var downloadstatus = [];

		if(!inputs){
			return Promise.all([]);
		}
		//Initialize download status to false
		for(var i = 0; i < inputs.length; i++){
			downloadstatus.push(false);
		}

		//Check for the jobstatus and downloadstatus part of the job
		//They are organized the same way as the array initialize in the previous step
		if(doc.jobstatus && doc.jobstatus.downloadstatus){
			var ds = doc.jobstatus.downloadstatus;
			for(var i = 0; i < ds.length; i++){
				if(ds[i].status){
					downloadstatus[i] = ds[i];
				}
			}
		}

		//If the download status is ok then don't download again. 
		for(var i = 0; i < inputs.length; i++){
			var input = inputs[i];
			if(downloadstatus[i] && handler.fileExists(cwd, input)){
				alldownloads.push(downloadstatus[i]);
			}else{				
				alldownloads.push(handler.savePromise(doc, cwd, input)
				.catch(function(e){
					console.error(e);
					return e;
				}));
			}
		}		
		return Promise.all(alldownloads);
	}

	handler.createDirectoryCWD = function(doc){
		var cwd = path.join(conf.storagedir, doc._id);
		try{
			fs.mkdirSync(cwd);
		}catch(e){
			if(e.code !== 'EEXIST'){
				throw e;
			}
		}
		
		return cwd;
	}

	handler.compressdirectory = function(doc, name){
		return new Promise(function(resolve, reject){
			var dirname;
			if(name === "cwd"){
				dirname = path.join(conf.storagedir, doc._id);
			}else{
				dirname = path.join(conf.storagedir, doc._id, name);
				if(dirname.substr(-1) === '/'){
					dirname = dirname.substr(0, dirname.length - 1);
				}
			}
			
			var tarname = dirname + ".tar.gz";

			var dirstat;
			try{
				dirstat = fs.statSync(dirname);
				if(dirstat){
					tarGzip.compress({
					    source: dirname,
					    destination: tarname
					}, function(){
						resolve(tarname);
					});
				}else{
					reject({
						"error": "Directory not found: " + dirname
					})
				}
				
			}catch(e){
				reject({
					"error": e
				});
			}
			
		});
	}

	handler.compressAndAddAttachment = function(doc, cwd, name){
		return handler.compressdirectory(doc, name)
		.then(function(compressedpath){
			var compressedname = path.basename(compressedpath);
			return handler.addDocumentAttachment(doc, compressedname, compressedpath)
		})
		.catch(function(e){
			return e;
		});
	}

	const uploadAttachment = function(params){
		var doc = params.doc;
		var output = params.output;
		var cwd = params.cwd;

		var getlatestdoc = handler.getDocument(doc._id);

		if(output.type === 'file'){
			return getlatestdoc
			.then(function(latestdoc){
				var filepath;
				if(output.path){
					filepath = path.join(cwd, output.path)
				}else{
					filepath = path.join(cwd, output.name)
				}
				return handler.addDocumentAttachment(latestdoc, output.name, filepath);
			});
			
		}else if(output.type === 'tar.gz'){
			return getlatestdoc
			.then(function(latestdoc){
				return handler.compressAndAddAttachment(latestdoc, cwd, output.name);
			});
		}else if(output.type === 'directory'){
			return getlatestdoc
			.then(function(latestdoc){
				return handler.addDocumentDirectoryAttachment(latestdoc, cwd, output.name);
			});
		}else{
			throw "Upload handler for " + output.type + "not available";
		}
	}

	handler.setAllDocumentOutputs = function(doc){
		var cwd = path.join(conf.storagedir, doc._id);
		var outputs = doc.outputs;

		var promparams = [];
		for(var i = 0; i < outputs.length; i++){
			promparams.push({
				doc: doc,
				output: outputs[i],
				cwd: cwd
			});
		}

		return Promise.map(promparams, uploadAttachment, {concurrency: 1});
	}

	const checkBeforeUpload = function(params){
		if(!params.ok){
			return uploadAttachment(params)
			.catch(function(e){
				return e;
			});
		}
		return params;
	}

	handler.checkAllDocumentOutputs = function(doc){
		var uploadstatus = doc.jobstatus.uploadstatus;
        var outputs = doc.outputs;
        var cwd = path.join(conf.storagedir, doc._id);

        var promparams = [];

        for(var i = 0; i < outputs.length; i++){
            if(!uploadstatus || !uploadstatus[i] || !uploadstatus[i].ok){
                promparams.push({
					doc: doc,
					output: outputs[i],
					cwd: cwd
				});
            }else{
            	promparams.push(uploadstatus[i]);
            }
        }
        return Promise.map(promparams, checkBeforeUpload, {concurrency: 1})
	}

	handler.deleteFolderRecursive = function(dir) {
		var dirstat;
		try{
			dirstat = fs.statSync(dir);
		}catch(e){
			//does not exist
			dirstat = undefined;
		}
		if(dirstat){
			fs.readdirSync(dir).forEach(function(file) {
				var currentpath = path.join(dir, file);
				if(fs.statSync(currentpath).isDirectory()) {
					handler.deleteFolderRecursive(currentpath);
				}else{
					fs.unlinkSync(currentpath);
				}
			});
			fs.rmdirSync(dir);
			return true;
	    }
	    return false;
	}

	//One of
	//'CREATE', 'QUEUE', 'DOWNLOADING', 'RUN', 'FAIL', 'KILL', 'UPLOADING', 'EXIT', 'DONE'
	handler.getJobsStatus = function(status){
		if(conf.executionserver){
			return clusterpost.getExecutionServerJobs(conf.executionserver, status);
		}else{
			return Promise.reject("No executionserver in configuration.", JSON.stringify(conf), "Set the codename for the executionserver as 'executionserver: servername'");
		}
	}

	handler.getJobsQueue = function(){
		return handler.getJobsStatus("QUEUE")
	}

	handler.getJobsRun = function(){
		return handler.getJobsStatus("RUN");
	}

	handler.getJobsUploading = function(){
		return handler.getJobsStatus("UPLOADING");
	}

	handler.getJobsKill = function(){
		return handler.getJobsStatus("KILL");
	}

	handler.getJobsDelete = function(){
		return clusterpost.getDeleteQueue();
	}

	return handler;

}
