var argv = require('minimist')(process.argv.slice(2));

const help = function(){
    console.error("Help: Helper app for cli operations for clusterpost");
    console.error("Options:");
    console.error("get");
    console.error("post");
    console.error("\nExample:");
    console.error("node index.js post --help");
}

if(argv._[0] == 'get'){
    require('./get');
}else if(argv._[0] == 'post'){
    require('./post');
}else{
    help();
    process.exit(1);
}