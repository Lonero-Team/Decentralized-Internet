
const Joi = require('@hapi/joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const request = require('request');
const Promise = require('bluebird');
const _ = require('underscore');
const HapiJWTCouch = require('./index');
var hapijwtcouch = new HapiJWTCouch();
var conf = require("./conf.test");

lab.experiment("Test hapi-jwt-couch-lib auth jwt", function(){

    hapijwtcouch.setServer(conf.test.server);

    var token = '';
    var user = {
        email: "hapi.jwt.couch@gmail.com",
        name: "Hapi jwt",
        password: "SomePassword90!"
    }

    lab.test('returns true when new user is created.', function(){

        return hapijwtcouch.createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required());
        });
        
    });

    lab.test('returns true if same user fails to be created.', function(){
        
        return hapijwtcouch.createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.object().keys({ 
                statusCode: Joi.number().valid(409),
                error: Joi.string(),
                message: Joi.string()
            }));
        });
    });

    lab.test('returns true when recovery email is sent.', function(){

        
        return hapijwtcouch.resetPassword({
            email: user.email
        })
        .then(function(res){
            Joi.assert(res, Joi.string().valid('An email has been sent to recover your password.'));
        });
    });    

    lab.test('returns true when user is logged in.', function(){

        var user = {
            email: "hapi.jwt.couch@gmail.com",
            password: "SomePassword90!"
        }

        return hapijwtcouch.userLogin(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required())
            token = res;
        });
        
    });

    lab.test('returns true when unauthorized user access api.', function(){

        return hapijwtcouch.getUsers()
        .then(function(res){
            
            Joi.assert(res, Joi.object().keys({ 
                statusCode: Joi.number().valid(403),
                error: Joi.string(),
                message: Joi.string(),
                attributes: Joi.object()
            }));
        });
        
    });

    lab.test('returns true when user information is retrieved, additional information is added and additional information is retrieved', function(){
        
        return hapijwtcouch.getUser()
        .then(function(user){

            user.projects = [{
                _id: "someprojectid"
            }]

            return hapijwtcouch.updateUser(user);
            
        })
        .then(function(res){
            return hapijwtcouch.getUser();
        })
        .then(function(user){
            Joi.assert(user.projects, Joi.array().items(Joi.object()));            
        });
    });

    lab.test('returns true when user scope is updated manually to admin', function(){
        
        return hapijwtcouch.getUser()
        .then(function(user){    

            return new Promise(function(resolve, reject){
                var options = { 
                    uri: conf.test.userdb.hostname + "/" + conf.test.userdb.database + "/" + user._id,
                    method: 'GET'
                };
                
                request(options, function(err, res, body){
                    var user = JSON.parse(body);
                    
                    user.scope.push('admin');

                    var options = { 
                        uri: conf.test.userdb.hostname + "/" + conf.test.userdb.database + "/_bulk_docs",
                        method: 'POST', 
                        json : {
                            docs: [user]
                        }
                    };
                    
                    request(options, function(err, res, body){

                        if(err){
                            reject(err);
                        }else if(body.error){
                            reject(body.error);
                        }else{
                            resolve(body);
                        }
                    });
                });
            });
        });
    });


    var newUserToken = '';
    var newuser = {
        email: "someemail@gmail.com",
        name: "Test user",
        password: "Some88Password!"
    }

    lab.test('returns true when a user is created, then all users are fetched by the admin, the scope of the new user is updated by the admin', function(){        

        return hapijwtcouch.createUser(newuser)
        .then(function(res){
            var user = {
                email: "someemail@gmail.com",
                password: "Some88Password!"
            }

            return hapijwtcouch.userLogin(user);
        }).then(function(res){            
            newUserToken = res;
            hapijwtcouch.setUserToken(token);
            return hapijwtcouch.getUsers();//This is the admin token defined before, do not confuse with the newUserToken
        })       
        .then(function(res){

            var users = JSON.parse(res);
            Joi.assert(users, Joi.array().items(Joi.object()));

            var userfound = _.find(users, function(user){
                return user.email === newuser.email;
            });

            userfound.scope.push('clusterpost');

            return hapijwtcouch.updateUsers(userfound);
        })
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));
        });
    });

    lab.test('Returns true if the "default" user fails to modify the admin user', function(){

        return hapijwtcouch.getUser()
        .then(function(res){
            
            var adminuser = res;
            adminuser.scope = ['default'];

            hapijwtcouch.setUserToken(newUserToken);
            return hapijwtcouch.updateUsers(adminuser);
        })
        .then(function(res){            
            Joi.assert(res.statusCode, 403);
        });
    });

    lab.test('Returns true if admin user deletes an user', function(){

        hapijwtcouch.setUserToken(token);

        return hapijwtcouch.getUsers()
        .then(function(res){

            var users = JSON.parse(res);
            Joi.assert(users, Joi.array().items(Joi.object()));

            var userfound = _.find(users, function(user){
                return user.email === newuser.email;
            });
            
            return hapijwtcouch.deleteUsers(userfound);
        })
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));
        });
    })

    lab.test('returns true when valid user deletes itself.', function(){

        return hapijwtcouch.deleteUser()
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));
        });
        
    });

});