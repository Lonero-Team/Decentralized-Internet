
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');

const Joi = require('@hapi/joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const couchProvider = require("./couch.provider");

var confexample = {
    "default": "testdb",
    "testdb" : {
        "hostname" : "http://localhost:5984",
        "database" : "testdb"
    },
    "testdb1" : {
        "hostname" : "http://localhost:5984",
        "database" : "testdb1",
        "datapath" : path.join(__dirname, "testdb1")
    }
}

couchProvider.setConfiguration(confexample);

var joiokres = Joi.object().keys({
        ok: Joi.boolean().valid(true),
        id: Joi.string(),
        rev: Joi.string()
    });

lab.experiment("Test couch-provider", function(){

    var doc = {
        "some_data" : "This is a string with some data"
    }

    var testsuit = function(codename){

        lab.test('returns true when the url of the couchdb server is retrieved', function(){

            var url = couchProvider.getCouchDBServer(codename);

            if(!codename){
                codename = confexample.default;
                console.log(codename);
            }

            if(url !== confexample[codename].hostname + "/" + confexample[codename].database){
                console.error(url, confexample[codename].hostname)
                throw "Returned configuration hostname is not the same"
            }

            return Promise.resolve();
        });

        lab.test('returns true when a database is created', function(){

            return couchProvider.createDB(codename)
            .then(function(res){
                console.log(res);
                return true;
            })
     
            
        });

        var docids = [];


        lab.test('returns true when a document is uploaded to the DB and when document is fetch from the database', function(){

            return couchProvider.uploadDocuments(doc, codename)
            .then(function(res){
                docids = _.pluck(res, "id");
            });
        });


        lab.test('returns true when a when document is fetch from the database', function(){
            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename);
            })
            .then(function(doc){
                console.log(doc);
            });
        });
        

        var filename = path.join(__dirname, "README.md");
        lab.test('returns true when attachment is added', function(){

            var stream = fs.createReadStream(filename);

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.addDocumentAttachment(doc, path.join("testname", path.basename(filename)), stream, codename);
                });
            });
        
        });

        lab.test('returns true when second attachment is added', function(){

            var stream = fs.createReadStream(filename);

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.addDocumentAttachment(doc, path.join("testname", path.basename(filename) + "_2"), stream, codename);
                });
            });
        
        });

        lab.test('returns true when the attachment is retrieved', function(){

            var filecontent = fs.readFileSync(filename);

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.getDocumentAttachment(doc, "testname/README.md", codename);
                })
                .then(function(res){
                    if(res.toString() !== filecontent.toString()){
                        throw "File retrieved from DB is not the same";
                    }
                });
            });
        });

        lab.test('returns true when attachment is deleted', function(){

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.deleteAttachment(doc, "testname/README.md", codename);
                })
                .then(function(res){
                    console.log(res);
                });
            });
        });

        lab.test('returns error when same attachment is deleted', function(){

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.deleteAttachment(doc, "testname/README.md", codename);
                })
                .catch(function(res){
                    console.log(res);
                });
            });
        });

        lab.test('returns true when second attachment is deleted', function(){

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.deleteAttachment(doc, "testname/README.md_2", codename);
                })
                .then(function(res){
                    console.log(res);
                });
            });
        });

        lab.test('returns true when attachment is added again', function(){

            var stream = fs.createReadStream(filename);

            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.addDocumentAttachment(doc, path.join("deletedoctest", path.basename(filename)), stream, codename);
                });
            });
        
        });

        lab.test('returns true when document is deleted', function(){
            return Promise.map(docids, function(docid){
                return couchProvider.getDocument(docid, codename)
                .then(function(doc){
                    return couchProvider.deleteDocument(doc, codename);
                })
                .then(function(res){
                    console.log("Document deleted", res);
                });
            });
        });
    }
    
    testsuit();//This will use the default name
    testsuit("testdb1"); 


});