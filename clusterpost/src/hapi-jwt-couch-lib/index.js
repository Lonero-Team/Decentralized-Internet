'use strict'
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var os = require('os');

var request = require('request');
var Promise = require('bluebird');
var _ = require('underscore');
var prompt = require('prompt');
var jws = require('jsonwebtoken');

module.exports = class HapiJWTCouch{
    constructor(){
        this.auth = {};
        this.uri = "";
        this.agentOptions = {};
        this.setServerUri = this.setServer;
    }

    getAuth(){
        return this.auth;
    }

    setServer(uri){
        if(_.isObject(uri)){
            _.extend(this, uri);
        }else{
            this.uri = uri;
        }
    }

    getserver(){
        return this.uri;
    }

    getServer(){
        return this.uri 
    }

    setAgentOptions(agentOptions){
        this.agentOptions = agentOptions;
    }

    promptUsernamePassword(){
        var self = this;
        return new Promise(function(resolve, reject){
            var schema = {
                properties: {
                    email: {
                        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                        message: 'Email address',
                        required: true
                    },
                    password: {                    
                        hidden: true,
                        required: true
                    }
                }
            };        
            prompt.get(schema, function (err, result) {
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            });
        });
    }

    promptServer(){
        var self = this;
        return new Promise(function(resolve, reject){
            var schema = {
                properties: {
                    uri: {
                        message: 'Please enter the server uri',
                        required: true
                    }
                }
            };        
            prompt.get(schema, function (err, result) {
                if(err){
                    reject(err)
                }else{
                    resolve(result);
                }
            });
        });
    }

    start(){
        var self = this;
        return self.promptServer()
        .then(function(server){
            self.setServer(server);
            return self.promptUsernamePassword()
        })
        .then(function(user){
            return self.userLogin(user);
        })
    }

    testUserToken(token){
        var jwt = jws.decode(token.token);
        var self = this;

        if(jwt.exp && jwt.exp < Date.now() / 1000){
            return false;
        }else if(jwt.exp === undefined){
            console.log("WARNING! The token does not have an expiry date. Tokens without expiry date were deprecated. The server could be running an old version. Please contact the server administrator.");
        }
        return true;
    }

    setUserToken(token){
        var self = this;
        if(_.isObject(token)){
            if(token.token){
                self.auth.bearer = token.token;
            }else{
                console.error("self.setUserToken: ", JSON.stringify(token));
                throw "Invalid token set for auth mechanism, must be an object {'token': 'someAuthToken'}";
            }
        }else{
            self.auth.bearer = token;
        }
    }

    getUserToken(){
        return {
            token: this.auth.bearer
        };
    }


    //Here the implementation of different functions starts
    createUser(user){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/user",
                method: 'POST',
                json: user,
                agentOptions: self.agentOptions
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

    resetPassword(user){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/reset",
                method: 'POST',
                json: user,
                agentOptions: self.agentOptions
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

    userLogin(user){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/login",
                method: 'POST',
                json: user,
                agentOptions: self.agentOptions
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else if(body && body.token){
                    self.auth.bearer = body.token
                    resolve(body);
                }else{
                    reject(body);
                }
            });
        });
    }

    getUser(){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/user",
                method: 'GET',
                auth: self.auth,
                agentOptions: self.agentOptions
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

    getUsers(){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/users",
                method: 'GET',
                auth: self.auth,
                agentOptions: self.agentOptions
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

    updateUser(userinfo){
        var self = this;
        return new Promise(function(resolve, reject){

            var usinfo = _.clone(userinfo);

            if(usinfo.scope){
                delete usinfo.scope;
            }

            var options = {
                url: self.getServer() + "/auth/user",
                method: 'PUT',
                json: usinfo,
                auth: self.auth,
                agentOptions: self.agentOptions
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

    updateUsers(userinfo){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/users",
                method: 'PUT',
                json: userinfo,
                auth: self.auth,
                agentOptions: self.agentOptions
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

    deleteUser(){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/user",
                method: 'DELETE',
                agentOptions: self.agentOptions,
                auth: self.auth
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

    deleteUsers(user){
        var self = this;
        return new Promise(function(resolve, reject){
            var options = {
                url: self.getServer() + "/auth/users",
                method: 'DELETE',
                agentOptions: self.agentOptions,
                auth: self.auth,
                json: user
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
}