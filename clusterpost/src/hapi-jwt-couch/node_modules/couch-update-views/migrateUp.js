
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

module.exports = function(dburl, viewsdir, test){

    const createDB = function(url){
        return new Promise(function(resolve, reject){
            request.put(url, function(err, res, body){
                if(err){
                    reject(err.message);
                }else{
                    try{
                        if(JSON.parse(body).error === "not_found"){
                            request.put(url, function(err, res, body){
                                resolve(JSON.parse(body));
                            });
                        }else{
                            resolve(JSON.parse(body));
                        }
                    }catch(e){
                        console.error(url);
                        console.error(e);
                        reject(e);
                    }
                }
            });
        });
    }

    const updateDocuments = function(url, viewsdir){

        var fileviews = fs.readdirSync(viewsdir); 

        var testView = function(file){
            return new Promise(function(resolve, reject){
                try{
                    if(file.indexOf(".json") === -1){
                        reject(file);
                    }else{
                        fs.readFile(path.join(viewsdir, file), function (err, data) {
                            if (err) throw err;
                            
                            var designdoc = JSON.parse(data);

                            var options = {
                                uri: url + "/" + designdoc._id
                            }

                            request(options, function(err, res, body){
                                var couchdesigndoc = JSON.parse(body);

                                if(JSON.stringify(designdoc.views) !== JSON.stringify(couchdesigndoc.views)){

                                    if(test && couchdesigndoc.error !== 'not_found'){

                                        console.info("You have two different design documents in the views directory and the couchdb instance:");
                                        console.info("You should 'migrateUp' the DB or 'update' the document in the view's folder to get rid of this message.");

                                        console.info("Run the following command to migrate the view in couchdb");
                                        console.info("node couchUpdateViews.js --migrate --viewsDir", viewsdir, "--couchDB", url);

                                        console.info("Run the following command to update in your directory");
                                        console.info("node couchUpdateViews.js --update", path.basename(file),"--viewsDir", viewsdir, "--couchDB", url);

                                        resolve({
                                            message: "Documents differ.",
                                            couchDB: url, 
                                            view: viewsdir+file
                                        });
                                    }else{

                                        if(couchdesigndoc.error === 'not_found'){
                                            console.info("Design document not found.");
                                        }

                                        console.info("Deploying design document: ", designdoc);

                                        var uri = url + "/" + designdoc._id;
                                        if(couchdesigndoc._rev){
                                            designdoc._rev = couchdesigndoc._rev;
                                            uri += "?rev="+designdoc._rev;
                                        }
                                        
                                        var options = {
                                            uri :  uri,
                                            method : 'PUT',
                                            json : designdoc
                                        }

                                        request(options, function(err, res, body){
                                            if(err){
                                                reject(err.message);
                                            }else{
                                                resolve(body);
                                            }
                                        });
                                    }
                                    

                                }else{                                
                                    resolve({
                                        message: "No changes in document.",
                                        couchDB: url, 
                                        view: viewsdir+file
                                    });
                                }
                            });
                        });
                    }
                }catch(e){
                    reject(e);
                }
            });
        }

        return Promise.map(fileviews, testView);
    }

    return createDB(dburl)
    .then(function(result){
        return updateDocuments(dburl, viewsdir);
    });
}
