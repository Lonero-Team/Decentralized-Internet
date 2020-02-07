# clusterpost-server

Execute jobs in remote computing grids using a REST api. Data transfer, job execution and monitoring are all handled by clusterpost.

Clusterpost uses node with Hapijs in the server side application plus couchdb for storage.

Cluster post is easy to deploy and will integrate well with existing applications.

## Installation

----
	npm install clusterpost-server
----

During the installation, the files 'conf.production.json', 'conf.test.json' and index.js are generated. 
You must edit conf.production.json and/or conf.test.json with your configuration options.

To run clusterpost in production mode run:

----
	NODE_ENV=production node index.js
----

## Install couchdb

Run the following command to test if you have a running couchdb instance

----
	curl http://localhost:5984
----

You should see the following output:

----
	{"couchdb":"Welcome","uuid":"b57a566769e70a49d251deac508ce1df","version":"1.6.1","vendor":{"version":"1.6.1","name":"The Apache Software Foundation"}}
----

## clusterpost-server configuration

Edit the files 'conf.*.json'

### tls to enable HTTPS (recommended for production)

You must either acquire a certificate or generate a selfsigned certificate by running the following commands:

----
	openssl genrsa -out key.pem 2048
	openssl req -new -key key.pem -out csr.pem
	openssl req -x509 -days 365 -key key.pem -in csr.pem -out certificate.pem
----

Finally edit the paths for 'tls' in the configuration section. 


### Server plugins

#### clusterpost-auth

This is a plugin extension of [hapi-jwt-couch](https://www.npmjs.com/package/hapi-jwt-couch)

This is a sample configuration file:

----
	{
		"privateKey": "GenerateSomeRandomKey",
		"saltRounds": 10,
		"algorithm": { 
			"algorithm": "HS256"
		},
		"algorithms": { 
			"algorithms": [ "HS256" ] 
		},
		"mailer": {
			"nodemailer": {
				"host": "smtp.gmail.com",
			    "secure": false,
			    "port": 587,
			    "auth": {
			        "user": "uname",
			        "pass": "pass"
			    }
			},
			"from": "clusterpost-server <clusterpost@gmail.com>",
			"message": "Hello @USERNAME@,<br>Somebody asked me to send you a link to reset your password, hopefully it was you.<br>Follow this <a href='@SERVER@/public/#/login/reset?token=@TOKEN@'>link</a> to reset your password.<br>The link will expire in 30 minutes.<br>Bye."
		},
		"userdb" : {
			"hostname": "http://localhost:5984",
			"database": "clusterjobs"
		}
	}
----

An easy way to generate a random key:

----
	openssl genrsa 128
----

Add your email configuration to use the 'reset' password service. 

This email account will be used to send a token to the user to reset the password in case they forgot it. 

Check https://github.com/nodemailer/nodemailer[nodemailer] for possible configurations

You can edit the message from mailer. The strings '@USERNAME@', @SERVER@ and @TOKEN@ are replaced during execution to personalize the message sent to the user.

Edit the userdb configuration to store user information. 


#### clusterpost-provider:

----
	"executionservers" : {
		"cluster" : {
			"hostname" : "some.computing.cluster.edu",
			"user" : "clusterpost",
			"identityfile" : "/home/.ssh/privateKeyWOPassword",
			"sourcedir" : "/home/clusterpost/source/executionserver"			
		}
	}
----

#### Executionservers:

Edit this field with the ssh configuration to connect to your computing grid.

You must generate a pair of private and public keys and be able to connect without entering a password.

'sourcedir' must point to the installation path of the 'clusterpost-execution' package.

To install this package follow the instruction in section [clusterpost-execution](https://www.npmjs.com/package/clusterpost-execution).

##### SSH Tunneling

If the clusterpost-server app does not have a public IP address and is not reachable from your computing grid, you can create an SSH tunnel to the computing grid by running:

----
	ssh username@computinggrid -R 8180:localhost:8180
---

This ssh command will create a reverse tunnel that will allow communication from clusterpost-execution to the clusterpost-server application.

###### Multiple login nodes. 

Frequently, a computing grid will have many login nodes. This poses a problem since the tunnel that we generated before will work only on the login node with the active ssh tunnel. 
 
To solve this issue, create a connection to one specific login node and use this login node for all future requests.

This is achieved by running.

----
	ssh -T -N -f username@computinggrid -L 2222:localhost:22
	ssh -T -N -f username@localhost -R 8180:localhost:8180
----

This will ensure that we will always be connected to the same login node all the time and we the tunnel will be available. 

### Starting the clusterpost-server. 

During installation, a script 'index.js' was generated with the following code.

--------
	var Hapi = require('hapi');
	var fs = require('fs');
	var good = require('good');
	var path = require('path');

	var env = process.env.NODE_ENV;

	if(!env) throw "Please set NODE_ENV variable.";


	const getConfigFile = function () {
	  try {
	    // Try to load the user's personal configuration file
	    return require(process.cwd() + '/conf.my.' + env + '.json');
	  } catch (e) {
	    // Else, read the default configuration file
	    return require(process.cwd() + '/conf.' + env + '.json');
	  }
	}

	var conf = getConfigFile();

	exports.server = new Hapi.Server();
	var server = exports.server;

	if(conf.tls && conf.tls.key && conf.tls.cert){
	    const tls = {
	      key: fs.readFileSync(conf.tls.key),
	      cert: fs.readFileSync(conf.tls.cert)
	    };
	}

	server.connection({ 
	    host: conf.host,
	    port: conf.port,
	    tls: tls
	});

	var plugins = [];

	Object.keys(conf.plugins).forEach(function(pluginName){
	    var plugin = {};
	    plugin.register = require(pluginName);
	    plugin.options = conf.plugins[pluginName];
	    plugins.push(plugin);
	});

	plugins.push({
	    register: good,
	    options: {
	        reporters: [
	        {
	            reporter: require('good-console'),
	            events: { log: '*', response: '*' }
	        }, {
	            reporter: require('good-file'),
	            events: { ops: '*' },
	            config: 'all.log'
	        }]
	    }
	});


	server.register(plugins, function(err){
	    if (err) {
	        throw err; // something bad happened loading the plugin
	    }

	    server.methods.executionserver.startExecutionServers()
	    .then(function(){
	        console.log("Execution servers started.");
	    });
	});


	exports.migrateUp = function(){
	    var clusterpostProvider = conf.plugins["clusterpost-provider"];
	    var clusterjobs = clusterpostProvider.dataproviders[clusterpostProvider.default.dataprovider]
	    var couchdb = clusterjobs.hostname + "/" + clusterjobs.database;

	    var views = path.join(__dirname, "./views");
	    var cuv = require('couch-update-views');
	    return cuv.migrateUp(couchdb, views);
	}
--------

Start the server by running:

----
	NODE_ENV=<production|test> node index.js
----

The parameter production or test will read from the configuration file generated.

Once you have started the server, visit http://localhost:8180/docs to check the API documentation for clusterpost.

You can add your own plugins check [Hapi](http://hapijs.com/tutorials/plugins) tutorial to create new plugins. 