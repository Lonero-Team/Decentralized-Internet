
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var os = require('os')

const Joi = require('joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();


var viewsDir = path.join(process.cwd(), 'views');
var couchdb = 'http://localhost:5984/testcouchupdateviews'
console.log('Running test for couchdb: ', couchdb, 'and viewsdir: ', viewsDir);

lab.experiment("Test couch-update-views", function(){

    lab.test('returns true when migration is done. test DB is created and design doc is updated', function(){
        
        console.log("Testing separate modules...");

        return require("./migrateUP")(couchdb, viewsDir)
        .then(function(res){

            Joi.assert(res, Joi.array().items(Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            })));

        });
    });

    lab.test('returns true when document is NOT updated because is the same.', function(){
        return require("./migrateUP")(couchdb, viewsDir)
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object().keys({
                error: Joi.string().valid("No changes in document."),
                couchDB: Joi.string(),
                view: Joi.string()
            })));
        });
    });

    lab.test('returns true when document is updated in temp folder.', function(){        
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

    
    var couchUpdateViews = require("./index.js");    

    lab.test('returns true when migration is done. test DB is created and design doc is updated', function(){
        console.log("Testing module entry point...");
        
        return couchUpdateViews.migrateUP(couchdb, viewsDir)
        .then(function(res){

            Joi.assert(res, Joi.array().items(Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            })));

        });
    });

    lab.test('returns true when document is NOT updated because is the same.', function(){
        return couchUpdateViews.migrateUP(couchdb, viewsDir)
        .then(function(res){
            Joi.assert(res, Joi.array().items(Joi.object().keys({
                error: Joi.string().valid("No changes in document."),
                couchDB: Joi.string(),
                view: Joi.string()
            })));
        });
    });

    lab.test('returns true when document is updated in temp folder.', function(){        
        return couchUpdateViews.updateDesignDocument(couchdb, os.tmpdir(), 'user')
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
    
});