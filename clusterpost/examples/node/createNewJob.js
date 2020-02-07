
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

const createJob = function(job){
    return new Promise(function(resolve, reject){
        var options = {
            url : "http://localhost:8180/dataprovider",
            method: "POST",
            json: job
        }

        request(options, function(err, res, body){
            if(err) reject(err);

            resolve(body);
        }
    });
    
}

const uploadfile = function(params){

	var filename = params.filename;
	var id = params.id;

	return new Promise(function(resolve, reject){

        try{
            var options = {
                url : "http://localhost:8180/dataprovider/" + id + "/" + path.basename(filename),
                method: "PUT",
                headers:{
                    "Content-Type": "application/octet-stream"
                }
            }

            var stream = fs.createReadStream(filename);

            stream.pipe(request(options, function(err, res, body){
                    if(err) resolve(err);
                    
                    resolve(body);
                    
                })
            );
        }catch(e){
            reject(e);
        }

	});
}

const submitJob = function(job){
    return new Promise(function(resolve, reject){
        try{
            var options = {
                url : "http://localhost:8180/executionserver/" + id,
                method: "POST"
            }

            request(options, function(err, res, body){
                if(err) reject(err);
                resolve(body);
            });
        }catch(e){
            reject(e);
        }
    });
        
}

var job = {
    "executable": "convert",
    "parameters": [
        {
            "flag": "",
            "name": "pic.jpg"
        },
        {
            "flag": "",
            "name": "pic.eps"
        }
    ],
    "inputs": [
        {
            "name": "pic.jpg"
        }
    ],
    "outputs": [
        {
            "type": "file",
            "name": "pic.eps"
        }
    ],
    "type": "job",
    "userEmail": "juanprietob@gmail.com",
    "executionserver" : "testserver"
};


var inputs = [
    "../data/pic.jpg"
];

//Create the job first
createJob(job)
.then(function(body){

//Upload the data

	var doc = body;
	var params = [];
	for(var i = 0; i < inputs.length; i++){
		params.push({
			filename: inputs[i],
			id: doc.id
		});
	}

	return Promise.map(params, uploadfile, {concurrency: 1})
    .then(function(allupload){
        console.log("Documents uploaded", allupload);
        return doc;
    });

})
.then(function(doc){
//submit the job
    return submitJob(doc);
})
.then(console.log)
.catch(console.error);










