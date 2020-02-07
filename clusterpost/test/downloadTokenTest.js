
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

var inputs = [
	"./data/gravitational-waves-simulation.jpg",
    "./data/gravitational-waves-simulation.jpg",
    "./data/gravitational-waves-simulation.jpg"
];
var names = [
    "./data/folder/1.jpg",
    "./data/folder/2.jpg",
    "./data/folder/folder1/3.jpg"
];
var jobid;

var joiokres = Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            });

var job = {
        "executable": "cksum",
        "parameters": [
            {
                "flag": "",
                "name": "./data/folder/1.jpg"
            }
        ],
        "inputs": [
            {
                "name": "./data/folder/1.jpg"
            },
            {
                "name": "./data/folder/folder1/3.jpg"
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
        "type": "job"
    };

var configfile = './conf.test.execution.json';

lab.experiment("Test clusterpost", function(){
    

    lab.test('returns true when starts', function(){

        return clusterpost.start(configfile)
        .then(function(){
            return true;
        })
        
    });

    lab.test('returns true job is created', function(){

        return clusterpost.createAndSubmitJob(job, inputs, names)
        .then(function(id){
            Joi.assert(id, Joi.string());
            jobid = id;
        })
        
    });
    

    lab.test('returns true if get attachment output stream is valid using a download token', function(){

        return clusterpost.getDownloadToken(jobid, "./data/folder/folder1/3.jpg")
        .then(function(res){
            Joi.assert(res.token, Joi.string());
            return clusterpost.downloadAttachment(res.token);
        });
    });

    lab.test('returns true if job is downloaded', function(){
        return clusterpost.downloadJob(jobid, 'temp.tar.gz')
        .then(function(status){
            console.log(status);
        });
    });

    lab.test('returns true if the document is deleted', function(){
        return clusterpost.deleteJob(jobid)
        .then(function(res){
            Joi.assert(res.status, Joi.string().valid("DELETE"));
        });
    });
    
});