
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

var agentOptions = {};

if(conf.tls && conf.tls.cert){
    agentOptions.ca = fs.readFileSync(conf.tls.cert);
}

clusterpost.setClusterPostServer(conf.uri);
clusterpost.setAgentOptions(agentOptions);

var inputs = [
	"./data/gravitational-waves-simulation.jpg"
];
var jobids;
var token;

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
        setTimeout(resolve, 65000);
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

var user1 = {
    email: "algiedi85_1@gmail.com",
    name: "Alpha Capricorni",
    password: "Some808Password!"
}

var joiokres = Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            });


lab.experiment("Test clusterpost", function(){
    

    lab.test('returns true when new users are created.', function(){

        return clusterpost.createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required());
            return clusterpost.createUser(user1);
        })
        .then(function(res){
            Joi.assert(res.token, Joi.string().required());
        });
        
    });

    lab.test('returns true when user1 is logged in.', function(){

        return clusterpost.userLogin({
            email: user.email,
            password: user.password
        })
        .then(function(res){
            Joi.assert(res.token, Joi.string().required())
        });
        
    });

    lab.test('returns true when the scope "clusterpost" is added manually to both users, note that the db used for this is clusterjobstest', function(){
        return new Promise(function(resolve, reject){

            var params = {
                key: '"algiedi85@gmail.com"',
                include_docs:true
            }

            var options = { 
                uri: "http://localhost:5984/clusterjobstest/_design/user/_view/info?" + qs.stringify(params),
                method: 'GET'
            };

            request(options, function(err, res, body){
                
                var user = _.pluck(JSON.parse(body).rows, "doc")[0];
                user.scope.push('clusterpost');

                var params = {
                    key: '"algiedi85_1@gmail.com"',
                    include_docs:true
                }

                var options = { 
                    uri: "http://localhost:5984/clusterjobstest/_design/user/_view/info?" + qs.stringify(params),
                    method: 'GET'
                };

                request(options, function(err, res, body){
                    var user1 = _.pluck(JSON.parse(body).rows, "doc")[0];
                    user1.scope.push('clusterpost');

                    var options = { 
                        uri: "http://localhost:5984/clusterjobstest/_bulk_docs",
                        method: 'POST', 
                        json : {
                            docs: [user, user1]
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


    lab.test('returns true when document is created', function(){

        var j0 = _.clone(job);
        j0.name = "jobEmailShared"
        j0.shared = [{userEmail: user1.email}];

        return clusterpost.getExecutionServers()
        .then(function(res){
            j0.executionserver = res[0].name;
            j1.executionserver = res[0].name;
            return Promise.map([j0, j1], clusterpost.createDocument);
        })
        .then(function(res){            
            Joi.assert(res, Joi.array().items(joiokres));
            jobids = _.pluck(res, "id");
            console.info("JOBID:", jobids);
        });
    });


    lab.test('returns true if the document is deleted', function(){
        return Promise.map(jobids, clusterpost.deleteJob)
        .then(function(res){
            Joi.assert(res, Joi.array().items(joiokres));
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

            return clusterpost.userLogin({
                email: user1.email,
                password: user1.password
            })
            .then(function(res){
                return clusterpost.deleteUser();
            })
            .then(function(res){
                Joi.assert(res, Joi.object().keys({ 
                    ok: Joi.boolean(),
                    id: Joi.string(),
                    rev: Joi.string()
                }));
            });
        });
    });
});