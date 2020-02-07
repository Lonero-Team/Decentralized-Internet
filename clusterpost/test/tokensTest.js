
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
var prompt = require('prompt');

configfile = './conf.test.execution.json';

lab.experiment("Test clusterpost", function(){
    
    lab.test('returns true when clusterpost starts as regular user', function(){
        return clusterpost.start(configfile)
        .then(function(res){
            return true;
        });
    });

    lab.test('returns true if tokens are not fetch as regular user', function(){
        return clusterpost.getExecutionServerToken()
        .then(function(res){
            Joi.assert(res.statusCode, 403);
        });
    });

    lab.test('returns true if token is fetch as admin user', function(){
        return clusterpost.promptUsernamePassword()
        .then(function(user){
            return clusterpost.userLogin(user)
        })
        .then(function(){
            return new Promise(function(resolve, reject){
                schema = {
                    properties: {
                        executionserver: {
                            message: 'Type the name of the execution server in the hapi configuration',
                            required: true
                        }
                    }
                };
                prompt.start();
                prompt.get(schema, function (err, result) {
                    if(err){
                        reject(err)
                    }else{
                        resolve(result);
                    }
                });
            });
        })
        .then(function(res){
            return clusterpost.getExecutionServerToken(res);
        })
        .then(function(res){
            Joi.assert(res, Joi.array().items(clustermodel.executionservertoken));
        });
    });
});