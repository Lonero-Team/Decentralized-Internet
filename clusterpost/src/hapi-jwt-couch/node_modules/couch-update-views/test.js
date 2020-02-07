
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var os = require('os')

const Joi = require('joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();


var viewsDir = path.join(process.cwd(), 'views');
var viewsDir2 = path.join(process.cwd(), 'views2');
var viewsDir3 = path.join(process.cwd(), 'views3');
var couchdb = 'http://localhost:5984/testcouchupdateviews'
console.log('Running test for couchdb: ', couchdb, 'and viewsdir: ', viewsDir);

lab.experiment("Test couch-update-views", function(){

    lab.test('returns true when migration is done. test DB is created and design doc is updated', function(){
        
        console.log("Testing migrateUp...");

        return require("./migrateUp")(couchdb, viewsDir)
        .then(function(res){

            Joi.assert(res, Joi.array().items(Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            })));

        });
    });

    lab.test('returns true if the documents are different, a help message is printed for the user.', function(){
        return require("./migrateUp")(couchdb, viewsDir2, true)
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object().keys({
                message: Joi.string().valid("Documents differ."),
                couchDB: Joi.string(),
                view: Joi.string()
            })));
        });
    });

    lab.test('returns true if the document is deployed while testing because the design document is not found', function(){
        return require("./migrateUp")(couchdb, viewsDir3, true)
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            })));
        });
    });

    lab.test('returns true when document is NOT updated because is the same.', function(){
        return require("./migrateUp")(couchdb, viewsDir)
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object().keys({
                message: Joi.string().valid("No changes in document."),
                couchDB: Joi.string(),
                view: Joi.string()
            })));
        });
    });

    lab.test('returns true when document is updated in temp folder.', function(){        
        console.log("Testing updateDesignDocument...");
        return require("./updateDesignDocument")(couchdb, os.tmpdir(), 'user')
        .then(function(res){            
            Joi.assert(res, Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string()
            }));
        });
    });

    lab.test('returns true when db is deleted.', function(done){
        var options = {
            url: couchdb,
            method: 'DELETE',
        }
        request(options, function(err, res, body){
            if(err){
                done(err);
            }else{
                done();
            }
        })
    });
        

    lab.test('returns true when migration is done. test DB is created and design doc is updated', function(done){
        console.log("Testing module entry point...");

        var couchUpdateViews = require("./index.js");

        Joi.assert(couchUpdateViews, Joi.object().keys({
            couchUpdateViews: Joi.func().arity(0),
            migrateUp: Joi.func().arity(3),
            updateDesignDocument: Joi.func().arity(3),
        }));
        
        done();
        
    });
    
});