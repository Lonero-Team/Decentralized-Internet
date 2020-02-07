
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
			var command = 'sbatch';
			var parameters = doc.parameters;

			var params = [];

			if(conf.hasbang){
				params.push(conf.hash_bang);
			}else{
				params.push("#!/bin/bash");
			}

			if(doc.jobparameters){
				for(var i = 0; i < doc.jobparameters.length; i++){
					var param_script = ["#SBATCH"]
					var param = doc.jobparameters[i];
                    if(param.flag){
                            param_script.push(param.flag);
                    }
                    if(param.name){
                            param_script.push(param.name);
                    }

                    params.push(param_script.join(" "));
				}
			}

			params.push(["#SBATCH", "-D", cwd].join(" "));
			params.push(["#SBATCH", "-e", path.join(cwd, "stderr.err")].join(" "));
			params.push(["#SBATCH", "-o", path.join(cwd, "stdout.out")].join(" "));
			params.push(["#SBATCH", "-J", doc.userEmail].join(" "));

			params_command = []
			params_command.push(doc.executable);
			if(parameters){
				for(var i = 0; i < parameters.length; i++){
					var param = parameters[i];
					if(param.flag){
						params_command.push(param.flag);
					}
					if(param.name){
						params_command.push(param.name);
					}
				}
			}

			params.push(params_command.join(" "));

			var script_filename = path.join(cwd, "slurm_script.sh");
			fs.writeFileSync(script_filename, params.join("\n"));

			try{
				const runcommand = spawn(command, [script_filename]);

				var allerror = "";
				runcommand.stderr.on('data', function(data){
					allerror += data;
				});

				var alldata = "";
				runcommand.stdout.on('data', function(data){
					alldata += data;
				});

				//"sample: Submitted batch job 3053044"
				runcommand.on('close', function(code){
					if(code){
						resolve({
							status: 'FAIL',
							error: allerror + alldata
						});
					}else{
						var stringfind = 'Submitted batch job ';
                        var ind = alldata.indexOf(stringfind) + stringfind.length;
						var jobid = alldata.substr(ind, alldata.length - ind);

						resolve({
							jobid : Number.parseInt(jobid),
							status: 'RUN'
						});
					}
				});
				
			}catch(e){
				reject({
					status: "FAIL",
					error: e
				});
			}

		});
		
	}

	handler.getJobStatus = function(doc){

		Joi.assert(doc.jobstatus, clustermodel.jobstatus);

		return new Promise(function(resolve, reject){

			try{

				var jobid = doc.jobstatus.jobid;
				
				var params = ["-h", "-j", jobid];

				const ps = spawn('squeue', params);

				var allerror = "";
				ps.stderr.on('data', function(data){
					allerror += data;
				});

				var alldata = "";
				ps.stdout.on('data', function(data){
					alldata += data;
				});
				
				//sample success: '3053968 general_b     wrap  jprieto PD       0:00      1 (Priority)'
				//sample fail: 'slurm_load_jobs error: Invalid job id specified' OR empty string

				ps.on('close', function(code){


					if(alldata){
						var job_status = alldata.replace(/ +/g, ' ').trim().split(' ');	
						//JOBID PARTITION NAME USER ST TIME NODES NODELIST(REASON)

						// BF BOOT_FAIL
						// Job terminated due to launch failure, typically due to a hardware failure (e.g. unable to boot the node or block and the job can not be requeued).
						// CA CANCELLED
						// Job was explicitly cancelled by the user or system administrator. The job may or may not have been initiated.
						// CD COMPLETED
						// Job has terminated all processes on all nodes with an exit code of zero.
						// CF CONFIGURING
						// Job has been allocated resources, but are waiting for them to become ready for use (e.g. booting).
						// CG COMPLETING
						// Job is in the process of completing. Some processes on some nodes may still be active.
						// DL DEADLINE
						// Job terminated on deadline.
						// F FAILED
						// Job terminated with non-zero exit code or other failure condition.
						// NF NODE_FAIL
						// Job terminated due to failure of one or more allocated nodes.
						// OOM OUT_OF_MEMORY
						// Job experienced out of memory error.
						// PD PENDING
						// Job is awaiting resource allocation.
						// PR PREEMPTED
						// Job terminated due to preemption.
						// R RUNNING
						// Job currently has an allocation.
						// RD RESV_DEL_HOLD
						// Job is held.
						// RF REQUEUE_FED
						// Job is being requeued by a federation.
						// RH REQUEUE_HOLD
						// Held job is being requeued.
						// RQ REQUEUED
						// Completing job is being requeued.
						// RS RESIZING
						// Job is about to change size.
						// RV REVOKED
						// Sibling was removed from cluster due to other cluster starting the job.
						// SI SIGNALING
						// Job is being signaled.
						// SE SPECIAL_EXIT
						// The job was requeued in a special state. This state can be set by users, typically in EpilogSlurmctld, if the job has terminated with a particular exit value.
						// SO STAGE_OUT
						// Job is staging out files.
						// ST STOPPED
						// Job has an allocation, but execution has been stopped with SIGSTOP signal. CPUS have been retained by this job.
						// S SUSPENDED
						// Job has an allocation, but execution has been suspended and CPUs have been released for other jobs.
						// TO TIMEOUT
						if(job_status.length > 5){
							if(job_status[4] == 'R' || job_status[4] == 'PD'){
								resolve({
									status: 'RUN',
									stat: alldata
								});
							}else if(job_status[4] == 'CD' || job_status[4] == 'CG'){
								resolve({
									status: 'DONE',
									stat: alldata
								});
							}else if(job_status[4] == 'SE' || job_status[4] == 'CA'){
								resolve({
									status: 'EXIT',
									stat: alldata
								});
							}else if(job_status[4] == 'F' || job_status[4] == 'NF'){
								resolve({
									status: 'FAIL',
									stat: alldata
								});
							}else{
								resolve({
									status: 'DONE',
									stat: alldata
								});
							}
						}else{
							resolve({
								jobid: jobid,
								status: 'DONE',
								stat: alldata
							});	
						}
						
					}else{
						resolve({
							jobid: jobid,
							status: 'DONE'
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

				const kill = spawn('scancel', params);

				var allerror = "";
				kill.stderr.on('data', function(data){
					allerror += data;
				});

				var alldata = "";
				kill.stdout.on('data', function(data){
					alldata += data;
				});

				kill.on('close', function(code){
					resolve({
						status: 'EXIT',
						stat: allerror + alldata
					});
				});


			}catch(e){
				reject(e);
			}
			
		});

	}

	return handler;
}
