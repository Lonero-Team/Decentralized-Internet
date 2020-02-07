# clusterpost-provider

This is an [Hapi](http://hapijs.com/) plugin to Execute jobs in remote computing grids using a REST api. Data transfer, job execution and monitoring are all handled by clusterpost.

Clusterpost uses node with Hapijs in the server side application plus couchdb for storage.

Cluster post is easy to deploy and will integrate well with existing applications.

To install the server application check the documentation in [clusterpost-server](https://www.npmjs.com/package/clusterpost-server)

This is a sample configuration. It requires [couch-provider](https://www.npmjs.com/package/couch-provider) to manage access to couchdb. The namespace 'clusterprovider' is used to discover the REST api for couchdb
in the hapi server application. 
The configuration for 'clusterpost-provider' contains a set of access credentials to computing grids.
For more information about the type of computing grids that are supported check [clusterpost-execution]()

This package depends on [hapi-jwt-couch](https://www.npmjs.com/package/hapi-jwt-couch), 
for the route authentication and encryption of tokens. 
The algorithm section has the parameters to encrypt the tokens that are emmited for the clusterpost-execution.

----
	var obj_config = {
		"hapi-jwt-couch": {"Configuration for hapi-jwt-couch"}
		"couch-provider": {
			"default" : "clusterjobstest",
			"clusterjobstest" : {
				"hostname": "http://localhost:5984",
				"database": "clusterjobstest"
			},
			"namespace": ["clusterprovider"]
		},
		"clusterpost-provider":{
			"algorithm": {
				"algorithm": "HS256",
				"expiresIn": "7d"
			},
			"executionservers" : {
				"testserver" : {
					"hostname" : "localhost", 
					"user" : "username",
					"identityfile" : "~/.ssh/id_rsa",
					"sourcedir" : "/path/to/install/clusterpost-execution/"			
				}
			}
		}
	}
----
