
module.exports = function (server, conf) {

	var Promise = require('bluebird');
	var jwt = require('jsonwebtoken');
	var bcrypt = require('bcrypt');
	const saltRounds = conf.saltRounds;
	var Boom = require('@hapi/boom');
	var _ = require('underscore');
	var nodemailer = require('nodemailer');
	var couchprovider = require('couch-provider').couchProvider;
	couchprovider.setConfiguration(conf.userdb);

	var couchUpdateViews = require('couch-update-views');
	var path = require('path');

	var transporter;

	if(conf.mailer.nodemailer === 'nodemailer-stub-transport'){
		transporter = nodemailer.createTransport(require(conf.mailer.nodemailer)());
	}else{
		transporter = nodemailer.createTransport(conf.mailer.nodemailer);
	}

	transporter.verify(function(error, success) {
		if (error) {
			console.log(error);
		}
	});

	couchUpdateViews.migrateUp(couchprovider.getCouchDBServer(), path.join(__dirname, 'views'), true)
	.catch(function(err){
		return couchUpdateViews.migrateUp(couchprovider.getCouchDBServer(), path.join(__dirname, 'views'));
	})
	.then(function(){
		return couchprovider.getView("_design/user/_view/scopes");
	})
	.then(function(res){		
		if(res && res.length === 0){
			console.log("Generating default scopes...");
			return couchprovider.uploadDocuments({
				type: 'scopes',
				scopes:['default','admin']
			})
			.then(function(){
				console.log("Done!");
			});
		}		
	})
	.catch(function(err){		
		console.error(err);
	});

	var handler = {};
	handler.validationFunctions = [];

	const addValidationFunction = function(valFunc){
		handler.validationFunctions.push(valFunc);
	}

	server.method({
		name: 'jwtauth.addValidationFunction',
		method: addValidationFunction,
		options: {}
	});

    const validate = async function (req, decodedToken) {
        
        return handler.validateUser(req, decodedToken)
        .then(function(res){
            return res;
        })
        .catch(function(err){
        	return Promise.any(_.map(handler.validationFunctions, function(valFunc){
        		return valFunc(req, decodedToken);
        	}))
        	.then(function(res){
        		return res;
        	})
        	.catch(Promise.AggregateError, function(err) {
        		return Promise.reject(Boom.unauthorized(err));
			});
        });
        
    }

    if(conf.algorithms){
        console.log("Please modify your configuration. Instead of field 'algorithms' change to 'verifyOptions'");
        server.auth.strategy('token', 'jwt', {
            key: conf.privateKey,
            validateFunc: validate,
            verifyOptions: conf.algorithms  // only allow HS256 algorithm
        });
    }else{
        server.auth.strategy('token', 'jwt', {
            key: conf.privateKey,
            validateFunc: validate,
            verifyOptions: conf.verifyOptions  // only allow HS256 algorithm
        });
    }

	const sign = function(data, algorithm){
		var token = {};
		var algo;
		if(algorithm){
			algo = algorithm;
		}else{
			algo = conf.algorithm;
		}
		token.token = jwt.sign(data, conf.privateKey, algo );
		return token;
	}

	server.method({
		name: 'jwtauth.sign',
		method: sign,
		options: {}
	});

	const verify = function(token){
		try{			
			var decodedToken = jwt.verify(token, conf.privateKey);
			return validateUser(decodedToken);
		}catch(e){
			throw Boom.unauthorized(e);
		}

	}

	server.method({
		name: 'jwtauth.verify',
		method: verify,
		options: {}
	});

	server.method({
		name: 'jwt.verify',
		method: function(token){
			return jwt.verify(token, conf.privateKey);
		},
		options: {}
	});

	const validateUser = function(decodedToken){
		return couchprovider.getView('_design/user/_view/info?key=' + JSON.stringify(decodedToken.email))
		.then(function(info){
			var info = _.pluck(info, "value");

			if(info.length > 1){
				throw Boom.unauthorized("More than 1 user with same email found in DB!");
			}else if(info.length === 0){
				throw Boom.unauthorized("User not found in db")
			}

			return info[0];
		});
	}

	handler.validateUser = function(req, decodedToken){
		return validateUser(decodedToken);
	}

	const bcryptHash = function(password){
		return new Promise(function(resolve, reject){
			bcrypt.hash(password, conf.saltRounds, function(err, hash) {
				if(err){
					reject(err);
				}else{
					resolve(hash);
				}
			});
		});
	}

	handler.createUser = function(req, rep){

		var email = req.payload.email;
		var password = req.payload.password;

		return couchprovider.getView('_design/user/_view/info?key=' + JSON.stringify(email))
		.then(function(info){

			var info = _.pluck(info, "value");
			if(info.length === 0){
				return bcryptHash(password);
			}else{
				throw Boom.conflict("User already exists");
			}
		})
		.then(function(hash){

			var user = req.payload;
			user.password = hash;
			user.type = 'user';
			user.scope = ['default'];

			return couchprovider.uploadDocuments(user)
			.then(function(res){
				res = res[0];
				if(res.ok){
					return server.methods.jwtauth.sign({ email: user.email });
				}else{
					throw Boom.badData(res);
				}
			});
			
		})
		.catch(function(err){
			return err;
		});

	}

	handler.getUser = function(req, rep){
		var credentials = req.auth.credentials;
		return credentials;
	}

	handler.getUsers = function(req, rep){
		return couchprovider.getView('_design/user/_view/info')
		.then(function(info){
			
			return _.pluck(info, 'value');

		})
		.catch(function(err){
			return Boom.badImplementation(err);
		})
	}

	handler.updateUser = function(req, rep){

		var user = req.auth.credentials;
		var updateinfo = req.payload;

		if(user.email !== updateinfo.email && user.scope.indexOf('admin') === -1){
			return (Boom.unauthorized('You cannot modify the user information'));
		}else{
			return couchprovider.getDocument(updateinfo._id)			
			.then(function(userindb){
				updateinfo.password = userindb.password;
				if(updateinfo.scope === undefined){
					updateinfo.scope = userindb.scope;
				}

				return couchprovider.uploadDocuments(updateinfo)
				.then(function(res){
					res = res[0];
					if(res.ok){
						return res;
					}else{
						throw res;
					}
				})
			})
			.catch(function(err){
				return Boom.badImplementation(err);
			});
		}
	}

	handler.updateUserBasic = function(req, rep){

		var user = req.auth.credentials;
		var updateinfo = req.payload;

		if(user.email !== updateinfo.email || user._id !== updateinfo._id){
			return (Boom.unauthorized('You cannot modify the user information'));
		}else{
			return couchprovider.getDocument(updateinfo._id)			
			.then(function(userindb){
				updateinfo.password = userindb.password;
				updateinfo.scope = userindb.scope;

				return couchprovider.uploadDocuments(updateinfo)
				.then(function(res){
					res = res[0];
					if(res.ok){
						return res;
					}else{
						throw res;
					}
				})
			})
			.catch(function(err){
				return Boom.badImplementation(err);
			});
		}
	}

	handler.login = function(req, rep){
		
		var email = req.payload.email;
		var password = req.payload.password;

		return couchprovider.getView('_design/user/_view/hash?key=' + JSON.stringify(email))
		.then(function(hash){
			return _.pluck(hash, "value")[0];
		})
		.then(function(hash){
			return new Promise(function(resolve, reject){
				bcrypt.compare(password, hash, function(err, res) {
					if(res){
						resolve(server.methods.jwtauth.sign({ email: email }));
					}else{
						reject(err);
					}
				});
			});
		})
		.catch(function(err){
			return (Boom.unauthorized(err));
		});
	}

	handler.loginUpdate = function(req, rep){

		var credentials = req.auth.credentials;
		var email = credentials.email;
		var password = req.payload.password;

		return couchprovider.getDocument(credentials._id)
		.then(function(user){
			return bcryptHash(password)
			.then(function(hash){
				
				user.password = hash;

				return couchprovider.uploadDocuments(user)
				.then(function(res){
					res = res[0];
					if(res.ok){
						return server.methods.jwtauth.sign({ email: user.email });
					}else{
						return Boom.badImplementation(res);
					}
				});
			})
		})
		.catch(function(err){
			return (Boom.unauthorized(err));
		});
	}

	handler.deleteUser = function(req, rep){
		
		var credentials = req.auth.credentials;
		var user = req.auth.credentials;

		if(req.payload){
			user = req.payload;	
		}

		if(user.email !== credentials.email && credentials.scope.indexOf('admin') === -1){
			return (Boom.unauthorized('You cannot delete the user'));
		}else{
			return couchprovider.deleteDocument(user)
			.then(rep)
			.catch(function(err){
				return (Boom.conflict(err));
			});
		}
	}

	handler.resetPassword = function(req, rep){
		
		var email = req.payload.email;

		return couchprovider.getView('_design/user/_view/info?key=' + JSON.stringify(email))
		.then(function(info){
			
			var info = _.pluck(info, "value");
			if(info.length === 0){
				throw Boom.unauthorized("I don't know who you are, you need to create an account first!");
			}

			info = info[0];

			var algorithm = _.clone(conf.algorithm);
			algorithm.expiresIn = "30m";

			var token = server.methods.jwtauth.sign({ email: info.email }, algorithm);
			
			var message = "Hello @USERNAME@,<br>Somebody asked me to send you a link to reset your password, hopefully it was you.<br>Follow this <a href='@SERVER@/public/#/login/reset?token=@TOKEN@'>link</a> to reset your password.<br>The link will expire in 30 minutes.<br>Bye.";

			if(conf.mailer.message){
				message = conf.mailer.message;
			}

			var uri = server.info.uri;

			if(conf.mailer.uri){
				uri = conf.mailer.uri;
			}
			
			message = message.replace("@USERNAME@", info.name);
			message = message.replace("@SERVER@", uri);
			message = message.replace("@TOKEN@", token.token);

			var mailOptions = {
			    from: conf.mailer.from,
			    to: email,
			    subject: 'Password reset', // Subject line
			    html: message
			};
			
			return new Promise(function(resolve, reject){
				transporter.sendMail(mailOptions, function(error, info){
				    if(error){
				        reject(Boom.badImplementation(error));
				    }else{
				    	resolve("An email has been sent to recover your password.");
				    }
				});
			})
			
		})
		.catch(function(err){
			console.log(err)
			return (Boom.wrap(err));
		});

		

		
	}

	handler.getScopes = function(req, rep){
		return couchprovider.getView('_design/user/_view/scopes?include_docs=true')
		.then(function(info){
			return (_.pluck(info, 'doc'));
		})
		.catch(function(err){
			return (Boom.badImplementation(err));
		})
	}

	handler.updateScopes = function(req, rep){

		var user = req.auth.credentials;
		var updateinfo = req.payload;

		if(user.scope.indexOf('admin') === -1){
			return (Boom.unauthorized('You cannot modify the scopes'));
		}else{
			return couchprovider.uploadDocuments(req.payload)
			.then(function(res){
				return (res[0]);
			})
			.catch(function(e){
				return (Boom.wrap(e));
			});
		}
	}



	return handler;
}