var clusterpost = require("clusterpost-lib");
var path = require('path');
var Promise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
const os = require('os');
const fs = require('fs');


var agentoptions = {
    rejectUnauthorized: false
}

clusterpost.setAgentOptions(agentoptions);

const help = function(){
    console.error("Help: Download tasks from the server.");
    console.error("\nOptional parameters:");
    console.error("--dir  Output directory, default: ./out");
    console.error("--status one of [DONE, RUN, FAIL, EXIT, UPLOADING, CREATE], default: DONE");
    console.error("--print , if provided the information is printed only");
    console.error("--delete, default false, when downloading jobs with status 'DONE', the jobs will be deleted upon completion");
    console.error("--j job id, default: ");
    console.error("--executable executable, default: all executables");
    console.error("--email email, default: (authenticated user)");
    console.error("--config_codename codename, default: clusterpost");
}

if(argv["h"] || argv["help"]){
    help();
    process.exit(1);
}

var deletejobs = false;
if(argv["delete"] !== undefined){
    console.log("After successful download, jobs with status DONE will be deleted!");
    deletejobs = true;
}

var userEmail = undefined;
if(argv["email"]){
    userEmail = argv["email"];
}

var outputdir = "./out";
if(argv["dir"]){
    outputdir = argv["dir"];
}

var status = 'DONE';
if(argv["status"]){
    status = argv["status"];
}
var jobid = argv["j"];
var executable = argv["executable"];
var print = argv["print"];

console.log("Output dir", outputdir);
console.log("Status", status);
if(jobid){
    console.log("jobid", jobid);
}

if(executable){
    console.log("executable", executable);   
}

if(print){
    console.log("print", print);   
}

var config_codename = 'clusterpost';
if(argv["config_codename"]){
    config_codename = argv["config_codename"];
}

clusterpost.start(path.join(os.homedir(), '.' + config_codename + '.json'))
.then(function(){

    if(!print){
        if(!jobid){
            return clusterpost.getJobs(executable, status, userEmail)
            .then(function(jobs){                
                return Promise.map(jobs, function(job){
                    console.log(JSON.stringify(job, null, 2));
                    if(job.outputdir){                        
                        return clusterpost.getJobOutputs(job, job.outputdir)
                        .then(function(){
                            if(job.name){
                                console.log(job.name, "downloaded...");
                            }else{
                                console.log(job._id, "downloaded...");
                            }
                            
                            if(deletejobs){
                                console.log("Deleting job");
                                return clusterpost.deleteJob(job._id);
                            }
                        });
                    }else{
                        var joboutputdir = undefined;
                        if(job.name){
                            joboutputdir = path.join(outputdir, job.name);
                        }else{
                            joboutputdir = path.join(outputdir, job._id);
                        }
                        
                        return clusterpost.getJobOutputs(job, joboutputdir)
                        .then(function(){
                            if(job.name){
                                console.log(job.name, "downloaded...");
                            }else{
                                console.log(job._id, "downloaded...");
                            }
                            if(deletejobs){
                                console.log("Deleting job");
                                return clusterpost.deleteJob(job._id);
                            }
                        });
                    }
                },
                {
                    concurrency: 1
                });
            });
        }else{
            return clusterpost.getDocument(jobid)
            .then(function(job){
                if(job.outputdir){
                    return clusterpost.getJobOutputs(job, job.outputdir);
                }else{
                    var joboutputdir = undefined;
                    if(job.name){
                        joboutputdir = path.join(outputdir, job.name);
                    }else{
                        joboutputdir = path.join(outputdir, job._id);
                    }
                    return clusterpost.getJobOutputs(job, joboutputdir);
                }
            })
            .then(function(){
                console.log("job downloaded...");
                if(deletejobs){
                    console.log("Deleting job");
                    return clusterpost.deleteJob(jobid);
                }
            });
        }
    }else{
        if(!jobid){
            return clusterpost.getJobs(executable, status, userEmail)
            .then(function(jobs){
                console.log(JSON.stringify(jobs, null, 2))
            });
        }else{
            return clusterpost.getDocument(jobid)
            .then(function(job){
                console.log(JSON.stringify(job, null, 2))
            });
        }
    }
    
})
.catch(console.error)
