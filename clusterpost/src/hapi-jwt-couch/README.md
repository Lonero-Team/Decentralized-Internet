# hapi-jwt-couch

Hapi plugin to validate users using [hapi-auth-jwt](https://github.com/ryanfitz/hapi-auth-jwt), storing user information and encrypted passwords 
in a couchdb instance. 

This plugin also provides a 'recover my password' option by setting up an email account using [nodemailer](https://github.com/nodemailer/nodemailer).

Edit the "message" portion of the configuration. The strings @USERNAME@, @SERVER@ and @TOKEN@ are replaced before sending the email. 

## Usage 

----
	npm install hapi-jwt-couch
----

### Hapi plugin

The values "user", "password" and "login" are optional. The default values are shown in this example. 

----
	const Hapi = require('hapi');
	cont Joi = require('@hapi/joi');

	var password = Joi.string().regex(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w\d!@#$%_-]{6,40}$/);

	var hapijwtcouch = {};
	hapijwtcouch.register = require("hapi-jwt-couch");
	hapijwtcouch.options = {
	        "privateKey": "SomeRandomKey123",
	        "saltRounds": 10,
	        "algorithm": { 
	            "algorithm": "HS256",
	            "expiresIn": "7d"
	        },
	        "validateOptions": { 
	            "algorithms": [ "HS256" ] 
	        },
	        "mailer": {
	            "nodemailer": {
					host: 'smtp.gmail.com',
				    port: 465,
				    secure: true, // use SSL
				    auth: {
				        user: 'hapi.jwt.couch@gmail.com',
				        pass: 'pass'
				    }
				},
				"from": "Hapi jwt couch <hapi.jwt.couch@gmail.com>",
				"message": "Hello @USERNAME@,<br>Somebody asked me to send you a link to reset your password, hopefully it was you.<br>Follow this <a href='@SERVER@/public/#/login/reset?token=@TOKEN@'>link</a> to reset your password.<br>The link will expire in 30 minutes.<br>Bye.",
				"uri": "http://your.public.ip"
	        },
	        "userdb" : {
	            "hostname": "http://localhost:5984",
	            "database": "hapijwtcouch"
	        },
	        "password" = password,
	        "user" = Joi.object().keys({
		        "name": Joi.string().required(),
		        "email": Joi.string().email().required(),
		        "password": password
	        }),
	        "login": Joi.object().keys({
		        "email": Joi.string().email().required(),
		        "password": password
		    })
	    };
	    

	var hapiauth = {};
	hapiauth.register = require("hapi-auth-jwt");
	hapiauth.options = {};


	var plugins = [hapiauth, hapijwtcouch];

	var server = new Hapi.Server();
	server.connection({ 
	    port: "3000"
	});

	server.register(plugins, function(err){
	    if (err) {
	        throw err; // something bad happened loading the plugin
	    }

	    server.start(function (err) {

	        console.log("server running", server.info.uri);
	        
	    });
	});
----

## Create your own Hapi plugin and extend it with your own validation function

You can extend this plugin by adding your own validation function. You may also change the validation for user, password and login Joi objects.

The Joi objects shown here for password, user and login are used by default.

----
	
	const Promise = require('bluebird');

	exports.register = function (server, conf, next) {

		//The validation function has this signature and the return value must be a Promise. 
		const validate = function(req, decodedToken){
			//validate your decoded token, the resulting object must have the field 'scope'
			if(validationTrue){
				return Promise.resolve({
					"scope": ["custom_scope"]
					});
			}else{
				return Promise.reject("Not validated");
			}
		}

		try{
			server.methods.jwtauth.addValidationFunction(validate);	
		}catch(e){
			console.error(e);
		}
		
		//Additional logic for your plugin

		return next();
		
	};

	exports.register.attributes = {
	  pkg: require('./package.json')
	};

----

## Testing 

Start the test server

----
	node test/server.js
----

Run all tests

----
	npm test
----

