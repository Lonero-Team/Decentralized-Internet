module.exports = function (server, conf) {
	
	var crontab = require('node-crontab');
	var _ = require('underscore');
	var Promise = require('bluebird');
	var os = require('os');
	var LinkedList = require('linkedlist');
	var find_process = require('find-process');



	var queue = new LinkedList();
	var inqueue = {};
	var retrievingJobs = false;
	
	var submitqueue = new LinkedList();
	var insubmitqueue = {};
	var submitingJobs = false;

	var deletequeue = new LinkedList();

	var killqueue = new LinkedList();

	var qs = require('querystring');

	const addJobToUpdateQueue = function(job){
		return new Promise(function(resolve, reject){
			try{
				if(!inqueue[job._id]){
					queue.push(job._id);
					inqueue[job._id] = job;
					resolve(true);
				}
				resolve(false);
			}catch(e){
				reject(e);
			}
		});
	}

	server.method({
	    name: 'cronprovider.addJobToUpdateQueue',
	    method: addJobToUpdateQueue,
	    options: {}
	});

	const addJobToSubmitQueue = function(job, force){
		return new Promise(function(resolve, reject){
			try{
				if(!insubmitqueue[job._id]){
					submitqueue.push(job._id);
					insubmitqueue[job._id] = {
						_id: job._id, 
						executionserver: job.executionserver,
						force: force
					};
					resolve(true);
				}
				resolve(false);
			}catch(e){
				reject(e);
			}
		});
	}

	server.method({
	    name: 'cronprovider.addJobToSubmitQueue',
	    method: addJobToSubmitQueue,
	    options: {}
	});

	const addJobToDeleteQueue = function(job){
		return new Promise(function(resolve, reject){
			try{				
				deletequeue.push(job);
				resolve(true);
			}catch(e){
				reject(e);
			}
		});
	}

	server.method({
	    name: 'cronprovider.addJobToDeleteQueue',
	    method: addJobToDeleteQueue,
	    options: {}
	});

	const addJobToKillQueue = function(job){
		return new Promise(function(resolve, reject){
			try{
				killqueue.push(job);
				resolve(true);
			}catch(e){
				reject(e);
			}
		});
	}

	server.method({
	    name: 'cronprovider.addJobToKillQueue',
	    method: addJobToKillQueue,
	    options: {}
	});

	const submitJobs = function(){

		return new Promise(function(resolve, reject){

			if(!submitingJobs && submitqueue.length > 0){

				submitingJobs = true;
				var jobs = [];
				
				while (submitqueue.length) {
					var jobid = submitqueue.shift();
					jobs.push(insubmitqueue[jobid]);
				}
				
				Promise.map(jobs, function(job){
		    		return server.methods.executionserver.submitJob(job)
		    		.then(function(res){
		    			delete insubmitqueue[job._id];
		    			return res;
		    		})
		    		.catch(function(e){
		    			console.error("Error while submitting job", job._id, e);
		    			return e;
		    		});
		    	}, {
		    		concurrency: 1
		    	})
		    	.then(function(res){
		    		submitingJobs = false;
		    		resolve(res);
		    	})
			    .catch(function(e){
			    	submitingJobs = false;
			    	console.error(e);
			    	reject(e);
			    });

				
			}else{
				return resolve(false);
			}
		});
	}

	server.method({
	    name: 'cronprovider.submitJobs',
	    method: submitJobs,
	    options: {}
	});

	const updateJobsStatus = function(){

		return new Promise(function(resolve, reject){
			if(!retrievingJobs && queue.length > 0){
				var jobs = [];
				retrievingJobs = true;
				while (queue.length) {
					var jobid = queue.shift();
					jobs.push(inqueue[jobid]);
				}

				Promise.map(jobs, function(job){
		    		return server.methods.executionserver.jobStatus(job)
		    		.then(function(status){
		    			delete inqueue[job._id];
		    			return status;
		    		})
		    		.catch(function(e){
		    			console.error("Error while updating job status", job._id, e);
		    			return e;
		    		});
		    	}, {
		    		concurrency: 1
		    	})
		    	.then(function(res){
		    		retrievingJobs = false;
		    		resolve(res);
		    	})
			    .catch(function(e){
			    	retrievingJobs = false;	
			    	console.error(e);
			    	reject(e);
			    });
			}else{
				resolve(false);
			}
		});
	}

	server.method({
	    name: 'cronprovider.updateJobsStatus',
	    method: submitJobs,
	    options: {}
	});

	const killJobs = function () {
		
		return new Promise(function(resolve, reject){
			if(killqueue.length > 0){
				var jobs = [];
				
				while (killqueue.length) {
					jobs.push(killqueue.shift());
				}				
				Promise.map(jobs, function(job){
		    		return server.methods.executionserver.jobKill(job)
		    		.catch(function(e){
				    	console.error("Error while killing job", job._id, e);
				    	return e;
				    });
		    	}, {
		    		concurrency: 1
		    	})
		    	.then(resolve)
			    .catch(function(e){
			    	console.error(e);
			    	reject(e);
			    });
			}else{
				resolve(false);
			}
		});
	}

	server.method({
	    name: 'cronprovider.killJobs',
	    method: submitJobs,
	    options: {}
	});

	const deleteJobs = function () {
		
		return new Promise(function(resolve, reject){			
			if(deletequeue.length > 0){
				var jobs = [];
				
				while (deletequeue.length) {
					jobs.push(deletequeue.shift());
				}

				Promise.map(jobs, function(job){					
		    		return server.methods.executionserver.jobDelete(job)
		    		.catch(function(e){
				    	console.error("Error while deleting job", job._id, e);
				    	console.error("Deleting from the DB now.");
				    })
		    		.then(function(){
		    			return server.methods.dataprovider.jobDelete(job);
		    		})
		    		.catch(function(e){
				    	console.error("Error while deleting job", job._id, e);
				    	return e;
				    });
		    	}, {
		    		concurrency: 1
		    	})
		    	.then(resolve)
			    .catch(function(e){
			    	console.error(e);
			    	reject(e);
			    });
			}else{
				resolve(false);
			}
		});
	}

	server.method({
	    name: 'cronprovider.deleteJobs',
	    method: submitJobs,
	    options: {}
	});

	const retrieveQueueJobs = function(){
		var view = "_design/searchJob/_view/jobstatus?key=" + JSON.stringify('QUEUE');
	    return server.methods.clusterprovider.getView(view)
	    .then(function(docs){
	    	return Promise.map(_.pluck(docs, "value"), server.methods.cronprovider.addJobToSubmitQueue);
	    })
	    .catch(console.error);
	}

	const retrieveRunningJobs = function(){
		var view = "_design/searchJob/_view/jobstatus?key=" + JSON.stringify('RUN');

	    return server.methods.clusterprovider.getView(view)
	    .then(function(docs){
	    	return Promise.map(_.pluck(docs, "value"), server.methods.cronprovider.addJobToUpdateQueue);
	    })
		.catch(function(e){
			console.error(e);
			return e;
		});
	}

	//Checks for stalled uploading tasks. 
	const retrieveUploadingJobs = function(){

		var view = "_design/searchJob/_view/jobstatus?key=" + JSON.stringify('UPLOADING');
	    return server.methods.clusterprovider.getView(view)
	    .then(function(docs){
	    	return Promise.map(_.pluck(docs, "value"), server.methods.cronprovider.addJobToUpdateQueue);
	    })
	    .catch(console.error);
		
	}

	const retrieveKillJobs = function(){
		var params = {
			key: JSON.stringify('KILL')
		}

		var view = "_design/searchJob/_view/jobstatus?" + qs.stringify(params);
		
	    return server.methods.clusterprovider.getView(view)
	    .then(function(docs){
	    	return Promise.map(_.pluck(docs, "value"), server.methods.cronprovider.addJobToKillQueue);
	    })
	    .catch(console.error);
	}

	const retrieveDeleteJobs = function(){
		var params = {
			key: JSON.stringify('DELETE')
		}

		var view = "_design/searchJob/_view/jobstatus?" + qs.stringify(params);
		
	    return server.methods.clusterprovider.getView(view)
	    .then(function(docs){
	    	return Promise.map(_.pluck(docs, "value"), server.methods.cronprovider.addJobToDeleteQueue);
	    })
	    .catch(console.error);
	}

	const retrieveJobs = function(){
		Promise.all([retrieveQueueJobs(), retrieveRunningJobs(), retrieveUploadingJobs(), retrieveKillJobs(), retrieveDeleteJobs()])
		.catch(console.error);
	}

	var cluster = server.methods.getCluster();
	
	var workerid = 1;

	if(cluster && cluster.worker){
		//The worker id [between 1 - N]
		workerid = cluster.worker.id;
	}

	//Every 1 minute(s)
	crontime = "*/"+String(1*workerid)+" * * * *";
	//This function is the one that runs and checks the different queues, it is done in sequence.
	crontab.scheduleJob(crontime, function(){
		submitJobs()
		.then(function(){
			return updateJobsStatus();
		})
		.then(function(){			
			return killJobs();
		})
		.then(function(){
			return deleteJobs();
		})
		.catch(console.error);
		
	});
	
	//Every 10 minutes
	crontime = "*/"+String(10*workerid)+" * * * *";
	//Retrieve the status of the jobs from the server
	crontab.scheduleJob(crontime, function(){
		retrieveJobs();
	});

	//Run once the retrieveQueueJobs() when starting the server
	retrieveJobs();

	const verifyTunnel = function(){
		if(server.app.tunnels){
			_.each(server.app.tunnels, function(tunnel, eskey){
				if(tunnel.pid){
					find_process('pid', tunnel.pid)
					.then(function (list) {
						if(list.length == 0){
							console.log("Attempting to restart the tunnel...");
							server.methods.executionserver.startTunnel(conf.executionservers[eskey])
							.then(function(tunnel){
								server.app.tunnels[eskey] = tunnel;
								console.log("Tunnel started:", eskey);
							})
							.catch(function(e){
								console.error("Starting tunnel failed:", e);
							});
						}
					}, function (err) {
						console.error(err);
					})
				}
			});
		}
	}

	//every ten minutes verify if the tunnel is open
	crontab.scheduleJob("*/10 * * * *", function(){
		verifyTunnel();
	})

}