
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');
var qs = require('querystring');

const Joi = require('@hapi/joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

var clusterpost = require("clusterpost-lib");
var clustermodel = require('clusterpost-model');

const getConfigFile = function (env, base_directory) {
  try {
    // Try to load the user's personal configuration file
    return require(base_directory + '/conf.my.' + env + '.json');
  } catch (e) {
    // Else, read the default configuration file
    return require(base_directory + '/conf.' + env + '.json');
  }
};

var env = process.env.NODE_ENV;
if(!env) throw "Please set NODE_ENV variable.";

var conf = getConfigFile(env, "./");

if(!conf.uri || !conf.couchdb){
    console.error("The configuration for the test is wrong. It must contain fields 'uri' and 'couchdb', example:");
    console.error(JSON.stringify({
        "uri": "http://localhost:8180",
        "couchdb": "http://localhost:5984/clusterjobstest"
    }, null, 2));
    process.exit(1);
}

console.log("Using the following configuration for test:", JSON.stringify(conf, null, 2));

var agentOptions = {};

if(conf.tls && conf.tls.cert){
    agentOptions.ca = fs.readFileSync(conf.tls.cert);
}

clusterpost.setClusterPostServer(conf.uri);
clusterpost.setAgentOptions(agentOptions);

var inputs = [
	"./data/gravitational-waves-simulation.jpg"
];
var jobid;
var token;
var tokenraw;

var updateJobStatusRec = function(jobid, validstatus){
    var clustermodelstatus = Joi.object().keys({
        jobid: Joi.number(),
        status: Joi.string().valid(validstatus),
        downloadstatus: Joi.array().items(Joi.object().keys({
            path: Joi.string(),
            status: Joi.boolean().valid(true)
        })), 
        uploadstatus: Joi.array().items(Joi.object())
    });

    return new Promise(function(resolve, reject){
        setTimeout(resolve, 70000);
    })
    .then(function(){
        return clusterpost.updateJobStatus(jobid)
        .then(function(jobstatus){
            Joi.assert(jobstatus, clustermodelstatus);
            return jobstatus;
        })
        .catch(function(e){
            return updateJobStatusRec(jobid);
        });
    })
}

var job = {
        "executable": "cksum",
        "parameters": [
            {
                "flag": "",
                "name": "gravitational-waves-simulation.jpg"
            }
        ],
        "inputs": [
            {
                "name": "gravitational-waves-simulation.jpg"
            }
        ],
        "outputs": [
            {
                "type": "directory",
                "name": "./"
            },            
            {
                "type": "tar.gz",
                "name": "./"
            },
            {
                "type": "file",
                "name": "stdout.out"
            },
            {
                "type": "file",
                "name": "stderr.err"
            }
        ],
        "type": "job",
        "userEmail": "algiedi85@gmail.com"
    };

var user = {
    email: "algiedi85@gmail.com",
    name: "Alpha Capricorni",
    password: "Some808Password!"
}

var joiokres = Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            });


var job2 = {
        "executable": "python",
        "parameters": [
            {
                "flag": "-c",
                "name": "while True: print '.'"
            }
        ],
        "outputs": [
            {
                "type": "file",
                "name": "stdout.out"
            },
            {
                "type": "file",
                "name": "stderr.err"
            }
        ],
        "type": "job",
        "userEmail": "algiedi85@gmail.com"
    };

lab.experiment("Test clusterpost", function(){
    

    lab.test('returns true when new user is created.', function(){

        return clusterpost.createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required());
        });
        
    });

    lab.test('returns true when user is logged in.', function(){

        var user = {
            email: "algiedi85@gmail.com",
            password: "Some808Password!"
        }

        return clusterpost.userLogin(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required())
            tokenraw = res.token;
            token = "Bearer " + res.token;
            console.log(res.token)
        });
        
    });

    lab.test('returns true when executionservers are fetched due to insufficient scope, the scope "clusterpost" is also added manually', function(){

        return clusterpost.getExecutionServers()
        .then(function(res){
            Joi.assert(res.statusCode, 403);
            
            return new Promise(function(resolve, reject){

                var params = {
                    key: '"algiedi85@gmail.com"',
                    include_docs: true
                }

                var options = { 
                    uri: conf.couchdb + "/_design/user/_view/info?" + qs.stringify(params),
                    method: 'GET'
                };

                request(options, function(err, res, body){
                    
                    var user = _.pluck(JSON.parse(body).rows, "doc")[0];
                    
                    user.scope.push('clusterpost');

                    var options = { 
                        uri: conf.couchdb + "/_bulk_docs",
                        method: 'POST', 
                        json : {
                            docs: [user]
                        }
                    };
                    
                    request(options, function(err, res, body){

                        if(err){
                            reject(err);
                        }else if(body.error){
                            reject(body.error);
                        }else{
                            resolve(body);
                        }
                    });
                });
            });
        });
    });


    lab.test('returns true when executionservers are fetched with valid scope', function(){

        return clusterpost.getExecutionServers()
        .then(function(res){
            job.executionserver = res[0].name;
            job2.executionserver = res[0].name;
        });
    });


    lab.test('returns true when document is created', function(){

        return clusterpost.createDocument(job)
        .then(function(res){            
            Joi.assert(res, joiokres);
            jobid = res.id;
            console.info("JOBID:", jobid);
        });
    });

    lab.test('returns true when document is fetched', function(){
        
        return clusterpost.getDocument(jobid)
        .then(function(job){
            Joi.assert(job, clustermodel.job);
            Joi.assert(job.jobstatus, Joi.object().keys({
                status: Joi.string().valid("CREATE")
            }))
        });        
    });

    lab.test('returns true when attachment is added', function(){
        
        return clusterpost.uploadFiles(jobid, inputs)
        .then(function(allupload){
            var joiupload = Joi.array().items(joiokres).min(1);
            Joi.assert(allupload, joiupload);
        });
    });


    lab.test('returns true when job is executed', function(){
        return clusterpost.executeJob(jobid)
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("QUEUE"));
        });
    });

    lab.test('returns true when jobstatus is RUN', function(){
        return updateJobStatusRec(jobid, "RUN")
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("RUN"));
        });
    });

    lab.test('returns true until jobstatus is DONE', function(){
        return updateJobStatusRec(jobid, "DONE")
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("DONE"));
        });
    });
    

    lab.test('returns true if get attachment output stream is valid', function(){
        return clusterpost.getDocumentAttachment(jobid, "stdout.out")
        .then(function(stdout){
            var value = "774035995 70572 gravitational-waves-simulation.jpg";
            if(stdout.indexOf(value) === -1){
                throw "Output validation not found: " + value;
            }
        });
    });

    lab.test('returns true if attachment not found', function(){
        return clusterpost.getDocumentAttachment(jobid, "stdout.err")
        .then(function(res){
            Joi.assert(res.statusCode, 404);
        });
    });

    lab.test('returns true if get attachment output stream is valid using a download token', function(done){
        clusterpost.getDownloadToken(jobid, "stdout.out")
        .then(function(res){
            Joi.assert(res.token, Joi.string());
            return clusterpost.downloadAttachment(res.token);
        })
        .then(function(stdout){
            var value = "774035995 70572 gravitational-waves-simulation.jpg";
            if(stdout.indexOf(value) === -1){
                throw "Output validation not found: " + value;
            }
        });
    });

    lab.test('returns true if the document is deleted', function(){
        return clusterpost.deleteJob(jobid)
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("DELETE"));
        });
    });

    lab.test('returns true when second job is created', function(){

        return clusterpost.createDocument(job2)
        .then(function(res){            
            Joi.assert(res, joiokres);
            jobid = res.id;
            console.info("JOBID:", jobid);
        });
    });

    lab.test('returns true when second job is executed', function(){
        return clusterpost.executeJob(jobid)
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("QUEUE"));
        });
    });

    lab.test('returns true when second jobstatus is RUN', function(){
        return updateJobStatusRec(jobid, "RUN")
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("RUN"));
        });
    });

    lab.test('returns true when second job is killed', function(){
        return clusterpost.killJob(jobid)
        .then(function(jobstatus){

            Joi.assert(jobstatus, clustermodel.jobstatus);
            Joi.assert(jobstatus.status, Joi.string().valid("KILL"));
        });
    });

    lab.test('returns true when second job is deleted', function(){
        return clusterpost.deleteJob(jobid)
        .then(function(jobstatus){
            Joi.assert(jobstatus.status, Joi.string().valid("DELETE"));
        });
    });

    lab.test('returns true if tokens are not fetch as regular user', function(){
        return clusterpost.getExecutionServerToken()
        .then(function(res){
            Joi.assert(res.statusCode, 403);
        });
    });


    lab.test('returns true when get all users is denied due to insufficient scope, updates scope manually to admin', function(){

        return clusterpost.getUsers()
        .then(function(res){
            Joi.assert(res.statusCode, 403);

            return new Promise(function(resolve, reject){

                var params = {
                    key: '"algiedi85@gmail.com"',
                    include_docs:true
                }

                var options = { 
                    uri: conf.couchdb + "/_design/user/_view/info?" + qs.stringify(params),
                    method: 'GET'
                };

                request(options, function(err, res, body){
                    
                    var user = _.pluck(JSON.parse(body).rows, "doc")[0];
                    user.scope.push('admin');

                    var options = { 
                        uri: conf.couchdb + "/_bulk_docs",
                        method: 'POST', 
                        json : {
                            docs: [user]
                        }
                    };
                    
                    request(options, function(err, res, body){

                        if(err){
                            reject(err);
                        }else if(body.error){
                            reject(body.error);
                        }else{
                            resolve(body);
                        }
                    });
                })
                

                
            });
        });
    });

    lab.test('returns true if tokens are fetch as admin user', function(){
        return clusterpost.getExecutionServerToken()
        .then(function(res){
            Joi.assert(res, Joi.array().items(clustermodel.executionservertoken));
            return Promise.map(res, function(es){
                delete es.token;
                return clusterpost.getExecutionServers(es);
            })
            .then(function(res){
                Joi.assert(_.flatten(res), Joi.array().items(clustermodel.executionservertoken));
            })
        });
    });

    lab.test('returns true when a user is created, then all users are fetched, the scope of the new user is updated and the new user is deleted', function(){

        var newuser = {
                email: "someemail@gmail.com",
                name: "Test user",
                password: "Some88Password!"
            }

        // This tests the admin power
        return clusterpost.createUser(newuser)    
        .bind({})
        .then(function(res){
            return clusterpost.getUsers();
        })
        .then(function(res){

            var users = JSON.parse(res);
            Joi.assert(users, Joi.array().items(Joi.object()));


            var userfound = _.find(users, function(user){
                return user.email == newuser.email;
            });
            
            userfound.scope.push('clusterpost');

            return clusterpost.updateUser(userfound);
        })
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));

            return clusterpost.getUser();
            
        })
        .then(function(res){

            var adminuser = _.isObject(res)? res : JSON.parse(res);
            adminuser.scope = ['default'];

            var newuserlog = {
                email: newuser.email,
                password: newuser.password
            }

            return clusterpost.userLogin(newuserlog)
            .then(function(token){
                return clusterpost.updateUser(adminuser);
            });
        })
        .then(function(res){
            Joi.assert(res.statusCode, 401);
            return clusterpost.userLogin({
                email: "algiedi85@gmail.com",
                password: "Some808Password!"
            })
            .then(function(token){
                return clusterpost.getUsers();
            });
        })
        .then(function(res){
            
            var userfound = _.find(JSON.parse(res), function(user){
                return user.email === newuser.email;
            });

            Joi.assert(userfound.scope, Joi.array().items(Joi.string().valid('default', 'clusterpost')));

            return userfound;
        })
        .then(function(userfound){
            return clusterpost.deleteUsers(userfound)
            .then(function(res){
                Joi.assert(res, Joi.object().keys({ 
                    ok: Joi.boolean(),
                    id: Joi.string(),
                    rev: Joi.string()
                }));
            });
        });
    });


    lab.test('returns true when valid user deletes itself.', function(){

        return clusterpost.deleteUser()
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));
        });
    });

});