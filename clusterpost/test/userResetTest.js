
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

const Joi = require('@hapi/joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();

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

var getClusterPostServer = function(){
    return conf.uri 
}

var joiokres = Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            });

var resetPassword = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/reset",
            method: 'POST',
            json: user,
            agentOptions: agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

lab.experiment("Test clusterpost auth jwt", function(){

    var user = {
        email: "algiedi85@gmail.com"
    }
    

    lab.test('returns true when an email is sent to the user with a link to reset the password', function(){

        return resetPassword(user)
        .then(function(res){
            console.log(res);
        });
        
    });

});