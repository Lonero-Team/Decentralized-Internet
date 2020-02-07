var clusterpost = require("clusterpost-lib");
var path = require('path');
var Promise = require('bluebird');
var argv = require('minimist')(process.argv.slice(2));
const _ = require('underscore');
const os = require('os');


var agentoptions = {
    rejectUnauthorized: false
}

clusterpost.setAgentOptions(agentoptions);

const help = function(){
    console.error("Help: Submit tasks to the server. Parses a command line, uploads the data and runs the task.");
    console.error("\nOptional parameters:");
    console.error("--parse_cli 'command as you would run it locally in your computer. It will only print the job'");
    console.error("--parse_cli_submit 'Parses cli and submits the task'");
    console.error("--executionserver 'name of computing grid, uses the first one by default'");
}

if(argv["h"] || argv["help"]){
    help();
    process.exit(1);
}

var config_codename = 'clusterpost';
if(argv["config_codename"]){
    config_codename = argv["config_codename"];
}

clusterpost.start(path.join(os.homedir(), '.' + config_codename + '.json'))
.then(function(){
    if(argv["parse_cli"]){
        var args = process.argv.slice(process.argv.indexOf('--parse_cli') + 1);
        return clusterpost.parseCLI(args);
    }else if(argv["parse_cli_submit"]){
        var args = process.argv.slice(process.argv.indexOf('--parse_cli_submit') + 1);
        return clusterpost.parseCLIAndSubmit(args, argv["executionserver"]);
    }
})
.then(function(res){
    console.log(JSON.stringify(res, null, 4));
})
.catch(console.error)
