
var Promise = require('bluebird');
var request = require('request');
var fs = require('fs');
var path = require('path');

module.exports = function(couchdb, viewsDir, design){
    
    design = design.replace('.json', '');
    var uri = couchdb + "/_design/" + design;
    
    return new Promise(function(resolve, reject){
        request(uri, function(err, res, body){
            if(err) {                
                reject(err);
            }else{
                var jsonbody = JSON.parse(body);
                delete jsonbody._rev;
                var jsonstring = JSON.stringify(jsonbody, null, 4);                
                var viewfilename = path.join(viewsDir, design + '.json');
                try{
                    var write = fs.writeFileSync(viewfilename, jsonstring);
                    resolve({
                        ok: true,
                        id: viewfilename
                    });
                }catch(err){
                    reject(err);
                }
            }
        });
    });
}