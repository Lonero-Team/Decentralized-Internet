
module.exports = function (conf) {

	var fs = require('fs');
	var Promise = require('bluebird');
	var _ = require("underscore");
	var spawn = require('child_process').spawn;
	var path = require('path');
	var Joi = require('@hapi/joi');

	var executionmethods = require('./executionserver.methods')(conf);
	var clustermodel = require('clusterpost-model');

	var handler = {};

	handler.submitJob = function(doc, cwd){

		Joi.assert(doc, clustermodel.job);

		return new Promise(function(resolve, reject){
			var command = doc.executable;
			var parameters = doc.parameters;

			var params = [];

			if(parameters){
				for(var i = 0; i < parameters.length; i++){
					var param = parameters[i];
					if(param.flag){
						params.push(param.flag);
					}
					if(param.name){
						params.push(param.name);
					}
				}
			}
			

			try{

				fs.writeFileSync(path.join(cwd, "stdout.out"), command + params.toString());

				var out = fs.openSync(path.join(cwd, "stdout.out"), 'a');
		    	var err = fs.openSync(path.join(cwd, "stderr.err"), 'a');

		    	var detached = true;

		    	if(conf.detached != undefined){
		    		detached = conf.detached;
		    	}

				const runcommand = spawn(command, params, {
					cwd: cwd,
					detached: detached,
					stdio: [ 'ignore', out, err ]
				});

				runcommand.on('error', function (err) {
				    reject({
						status: "FAIL",
						error: err
					});
				});

				if(detached){
					runcommand.unref();

					if(runcommand.pid){
						resolve({
							jobid : runcommand.pid,
							status: "RUN"
						});
					}else{
						reject({						
							status: "FAIL", 
							error: "nopid"
						});
					}
				}else{				

					runcommand.on('close', function(code){
						if(code){
							reject({						
								status: "FAIL"
							});
						}else{
							resolve({
								status: 'UPLOADING'
							});
						}
					});
				}
			}catch(e){
				reject({
					status: "FAIL",
					error: e
				});
			}

		});
		
	}

	handler.getJobStatus = function(doc){

		return new Promise(function(resolve, reject){

			try{

				Joi.assert(doc.jobstatus, clustermodel.jobstatus);
				Joi.assert(doc.jobstatus.jobid, Joi.number().required(), "Please execute the job first.");		

				var jobid = doc.jobstatus.jobid;
				var params = [jobid];

				const ps = spawn('ps', params);

				var allerror = "";
				ps.stderr.on('data', function(data){
					allerror += data;
				});

				var alldata = "";
				ps.stdout.on('data', function(data){
					alldata += data;
				});

				ps.on('close', function(code){
					var lines = alldata.split('\n');
					if(lines.length > 1){
						if(code && lines[1] === ''){
							resolve({
								status: 'DONE'
							});
						}else if(lines[1].indexOf(doc.executable) === -1){
							//replace multiple space by single space and split by space;							
							resolve({
								status: 'FAIL',
								error: 'The jobid does not match the running program'
							});
						}else{							
							resolve({
								jobid: jobid,
								status: 'RUN',
								stat: lines[1]
							});
						}
					}else{
						resolve({
							status: 'FAIL',
							error: allerror
						});
					}
					
				});

			}catch(e){
				reject(e);
			}
			
		});
	}

	handler.killJob = function(doc){

		Joi.assert(doc.jobstatus, clustermodel.jobstatus);

		return new Promise(function(resolve, reject){

			try{

				var jobid = doc.jobstatus.jobid;
				var params = [jobid];

				const kill = spawn('kill', params);

				var allerror = "";
				kill.stderr.on('data', function(data){
					allerror += data;
				});

				var alldata = "";
				kill.stdout.on('data', function(data){
					alldata += data;
				});

				kill.on('close', function(code){
					var stat = alldata;
					if(code){
						stat+= allerror;
					}
					resolve({
						status: 'EXIT',
						stat: stat
					});
				});


			}catch(e){
				reject(e);
			}
			
		});

	}

	return handler;
}