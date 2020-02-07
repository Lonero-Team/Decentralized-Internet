'use strict'

const clusterpost = require("clusterpost-lib");
const clustermodel = require("clustterpost-model");
const Joi = require('joi');
const path = require('path');

var agentoptions = {
    rejectUnauthorized: false
}

clusterpost.setAgentOptions(agentoptions);

clusterpost.start()
.then(function(){
	return clusterpost.getExecutionServerToken(executionserver);
	.then(function(token){
		Joi.assert(token, clustermodel.executionservertoken);
		console.log("Writing token to conf.json");
		fs.writeFileSync('conf.json', JSON.stringify(token));
	}).
})
.catch(console.error)