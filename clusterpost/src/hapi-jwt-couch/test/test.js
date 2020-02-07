
const Joi = require('@hapi/joi');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const request = require('request');
const Promise = require('bluebird');
const _ = require('underscore');
var agentOptions = {};

var getClusterPostServer = function(){
    return "http://localhost:8180"
}

var joiokres = Joi.object().keys({
                ok: Joi.boolean().valid(true),
                id: Joi.string(),
                rev: Joi.string()
            });
var token = "";

var createUser = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'POST',
            json: user,
            agentOptions: agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var userLogin = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/login",
            method: 'POST',
            json: user,
            agentOptions: agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var resetPassword = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/reset",
            method: 'POST',
            json: user,
            agentOptions: agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var getUser = function(token){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'GET',
            headers: { authorization: token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var getUsers = function(token){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/users",
            method: 'GET',
            headers: { authorization: token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var updateUser = function(userinfo, usertoken){

    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'PUT',
            json: userinfo,
            headers: { authorization: usertoken }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var deleteUser = function(token){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'DELETE',
            agentOptions: agentOptions,
            headers: { authorization: token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var deleteUsers = function(token, userinfo){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/users",
            method: 'DELETE',
            agentOptions: agentOptions,
            json: userinfo,
            headers: { authorization: token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

lab.experiment("Test clusterpost auth jwt", function(){

    var user = {
        email: "hapi.jwt.couch@gmail.com",
        name: "Hapi jwt",
        password: "SomePassword90!"
    }

    lab.test('returns true when new user is created.', function(){

        return createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required());
        });
        
    });

    lab.test('returns true if same user fails to be created.', function(){

        
        return createUser(user)
        .then(function(res){
            Joi.assert(res.token, Joi.object().keys({ 
                statusCode: Joi.number().valid(409),
                error: Joi.string(),
                message: Joi.string()
            }));
        });
    });

    lab.test('returns true when recovery email is sent.', function(){

        
        return resetPassword({
            email: user.email
        })
        .then(function(res){
            Joi.assert(res, Joi.string().valid('An email has been sent to recover your password.'));
        });
    });

    var token = "";

    lab.test('returns true when user is logged in.', function(){

        var user = {
            email: "hapi.jwt.couch@gmail.com",
            password: "SomePassword90!"
        }

        return userLogin(user)
        .then(function(res){
            Joi.assert(res.token, Joi.string().required())
            token = "Bearer " + res.token;
        });
        
    });

    lab.test('returns true when unauthorized user access api.', function(){
        return getUsers(token)
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                statusCode: Joi.number().valid(403),
                error: Joi.string(),
                message: Joi.string()
            }));
        });
        
    });

    lab.test('returns true when user scope is updated manually to admin', function(){
        
        return getUser(token)
        .then(function(user){
            console.log(user, "dddddddd")
            return new Promise(function(resolve, reject){
                var options = { 
                    uri: "http://localhost:5984/clusterjobstest/" + user._id,
                    method: 'GET'
                };
                
                request(options, function(err, res, body){
                    var user = JSON.parse(body);
                    console.log(body, "dddd")
                    user.scope.push('admin');

                    var options = { 
                        uri: "http://localhost:5984/hapijwtcouch/_bulk_docs",
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

        

        return createUser(newuser)
        .then(function(res){
            var user = {
                email: "someemail@gmail.com",
                password: "Some88Password!"
            }

            return userLogin(user);
        }).then(function(res){
            newUserToken = "Bearer " + res.token;
            return getUsers(token);//This is the admin token defined before, do not confuse with the newUserToken
        })       
        .then(function(res){

            var users = JSON.parse(res);
            Joi.assert(users, Joi.array().items(Joi.object()));

            var userfound = _.find(users, function(user){
                return user.email === newuser.email;
            });

            userfound.scope.push('clusterpost');

            return updateUser(userfound, token);
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

        return getUser(token)
        .then(function(res){
            
            var adminuser = res;
            adminuser.scope = ['default'];

            return updateUser(adminuser, newUserToken);
        })
        .then(function(res){
            Joi.assert(res.statusCode, 401);
        });
    });

    lab.test('Returns true if admin user deletes an user', function(){

        return getUsers(token)
        .then(function(res){

            var users = JSON.parse(res);
            Joi.assert(users, Joi.array().items(Joi.object()));

            var userfound = _.find(users, function(user){
                return user.email === newuser.email;
            });
            
            return deleteUsers(token, userfound);
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

        return deleteUser(token)
        .then(function(res){
            Joi.assert(res, Joi.object().keys({ 
                ok: Joi.boolean(),
                id: Joi.string(),
                rev: Joi.string()
            }));
        });
        
    });

});