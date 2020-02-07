
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');

var job = {
    "executable": "ComponentSizeRLE",
    "parameters": [
        {
            "flag": "--i",
            "name": "atlas_DD_040_t1w.nrrd"
        },
        {
            "flag": "--m",
            "name": "DD_040_seg.nii.gz"
        },
        {
            "flag": "--outputHistogram",
            "name": "outputHistogram.csv"
        },
        {
        	"flag": "--outputRLE",
        	"name": "outputRLE.csv"
        }
    ],
    "inputs": [
        {
            "name": "atlas_DD_040_t1w.nrrd"
        },
        {
            "name": "DD_040_seg.nii.gz"
        }
    ],
    "outputs": [
        {
            "type": "file",
            "name": "outputHistogram.csv"
        },
        {
        	"type": "file",
        	"name": "outputRLE.csv"
        },
        {
            "type": "directory",
            "name": "cwd"
        }
    ],
    "type": "job",
    "userEmail": "juanprietob@gmail.com",
    "executionserver" : "testserver"
};


var inputs = [
	"/Users/prieto/NetBeansProjects/UNC/data/canine/atlas_DD_040_t1w.nrrd",
	"/Users/prieto/NetBeansProjects/UNC/data/canine/DD_040_seg.nii.gz"
];

var uploadfile = function(params){

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

var options = {
    url : "http://localhost:8180/dataprovider",
    method: "POST",
    json: job
}

request(options, function(err, res, body){
	if(err) throw err;

	var doc = body;
	var params = [];
	for(var i = 0; i < inputs.length; i++){
		params.push({
			filename: inputs[i],
			id: doc.id
		});
	}

	Promise.map(params, uploadfile, {concurrency: 1})
	.then(function(allupload){
		console.log(allupload);
	})
	.catch(console.error);

});