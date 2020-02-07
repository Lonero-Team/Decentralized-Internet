const Hapi = require('hapi');

var hapiauth = {};
hapiauth.register = require("hapi-auth-jwt");
hapiauth.options = {};



var hapijwtcouch = {};
hapijwtcouch.register = require("../index");//require(hapi-jwt-couch)
hapijwtcouch.options = {
        "privateKey": "SomeRandomKey123",
        "saltRounds": 10,
        "algorithm": { 
            "algorithm": "HS256"
        },
        "algorithms": { 
            "algorithms": [ "HS256" ] 
        },
        "mailer": {
            "nodemailer": "nodemailer-stub-transport",
            "from": "Clusterpost <clusterpost@gmail.com>"
        },
        "userdb" : {
            "hostname": "http://localhost:5984",
            "database": "hapijwtcouch"
        }
    };

var plugins = [hapiauth, hapijwtcouch];

var server = new Hapi.Server();
server.connection({ 
    port: "3000"
});


plugins.push({
        register: require('good'),
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

    server.start(function (err) {

        console.log("server running", server.info.uri);
        
    });
});
