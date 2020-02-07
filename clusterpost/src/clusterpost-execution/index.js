
var _ = require('underscore');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');

var submit = argv["submit"];
var jobid = argv["j"];
var force = argv["f"];

var status = argv["status"];

var kill = argv["kill"];

var jobdelete = argv["delete"];

var remote = argv["remote"];

var help = function(){
    console.error("help: To execute the program you must specify the job id. ")
    console.error(process.argv[0] + " " + process.argv[1] + " -j <jobid>");
    console.error("To configure the couchdb, check conf.*.json");
    console.error("Options:");
    console.error("--submit 	Submit the job.");
    console.error("-f  			force job submission");
    console.error("--status  	get job status");
    console.error("--kill  		kill job");
    console.error("--delete  	delete job");
    console.error("--remote     run as a daemon");
}

if(!remote && (!jobid || !submit && !status && !kill && !jobdelete)){
    help();
    process.exit(1);
}

const getConfigFile = function (base_directory) {
  try {
    // Try to load the user's personal configuration file
    return require(path.join(base_directory, 'conf.my.json'));
  } catch (e) {
    // Else, read the default configuration file
    return require(path.join(base_directory, 'conf.json'));
  }
};

var confpath = __dirname;
if(module.parent && module.parent.filename){
    confpath = path.dirname(module.parent.filename);
}

var conf = getConfigFile(confpath);

try{
    if(!conf.token){
        var tokenfile = path.join(confpath, ".token");
        try{
            fs.statSync(tokenfile);
        }catch(e){
            tokenfile = path.join(confpath, "token.json");
        }
        
        if(conf.tokenfile){
            tokenfile = conf.tokenfile;
        }
        _.extend(conf, JSON.parse(fs.readFileSync(tokenfile)));
    }
    
}catch(e){    
    console.error(e);
    process.exit(1);
}

var executionmethods = require(path.join(__dirname, 'executionserver.methods'))(conf);
var clusterengine = require(path.join(__dirname, conf.engine))(conf);


if(remote){

    var crontab = require('node-crontab');
    var isrunningtask = false;

    crontab.scheduleJob("*/1 * * * *", function(){
        if(!isrunningtask){
            isrunningtask = true;        
            executionmethods.getJobsQueue()
            .then(function(jobs){
                console.log("jobsubmit", jobs);
                return Promise.map(jobs, function(doc){
                    return require(path.join(__dirname, "jobsubmit"))(doc, null, conf);
                }, 
                {
                    concurrency: 1
                });
            })
            .then(function(){
                return Promise.all([executionmethods.getJobsUploading(), executionmethods.getJobsRun()])
            })
            .then(function(jobs){            
                jobs = _.flatten(jobs);
                console.log("jobstatus", jobs);
                return Promise.map(jobs, function(doc){
                    return require(path.join(__dirname, "jobstatus"))(doc, conf);
                },
                {
                    concurrency: 1
                });
            })
            .then(function(){
                return executionmethods.getJobsKill()
            })
            .then(function(jobs){
                console.log("jobkill", jobs);
                return Promise.map(jobs, function(doc){                
                    return require(path.join(__dirname, "jobkill"))(doc, conf);
                },
                {
                    concurrency: 1
                });
            })
            .then(function(){
                return executionmethods.getJobsDelete();
            })
            .then(function(jobs){
                jobs = _.flatten(jobs);
                console.log("jobdelete", jobs);
                return Promise.map(jobs, function(doc){
                    return require(path.join(__dirname, "jobdelete"))(doc._id, conf, doc);
                },
                {
                    concurrency: 1
                });
            })
            .then(function(){
                isrunningtask = false;
            })
            .catch(function(error){
                console.error(error);
                process.exit(1);
            });
        }
        
    });

    console.log("Starting clusterpost-execution in remote mode:");

}else{

    if(jobdelete){            
        require(path.join(__dirname, "jobdelete"))(jobid, conf);
    }else{
        executionmethods.getDocument(jobid)
        .then(function(doc){ 

            if(submit){
                return require(path.join(__dirname, "jobsubmit"))(doc, force, conf);
            }else if(status){
                return require(path.join(__dirname, "jobstatus"))(doc, conf);
            }else if(kill){
                return require(path.join(__dirname, "jobkill"))(doc, conf);
            }
            
        })
        .then(function(res){
            console.log(res);
            process.exit();
        })
        .catch(function(error){
            console.error(error);
            process.exit(1);
        });
    }

    
}
