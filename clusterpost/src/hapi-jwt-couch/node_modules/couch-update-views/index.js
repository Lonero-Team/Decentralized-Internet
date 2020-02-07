
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');

const run = function(migrate, update, viewsDir, couchDB){

    var couchUpdateViews;

    if(migrate){
        couchUpdateViews = require(path.join(__dirname, "migrateUp"))(couchDB, viewsDir);    
    }else{
        couchUpdateViews = require(path.join(__dirname, "updateDesignDocument"))(couchDB, viewsDir, update);
    }


    return couchUpdateViews
    .then(function(res){
        console.log(res);
        process.exit(0);
    })
    .catch(function(err){
        console.error(err);
        process.exit(1);
    });
}

const help = function(){
    console.error("help: To run couch-update-views: ")
    console.error(process.argv[0] + " " + process.argv[1] + " --migrate | --update <design view name>");
    console.error("Options:");
    console.error("--migrate  Migrate design documents in couchdb. The 'design views' in couchdb are updated with the contents of the 'viewsDir' folder if they differ.");
    console.error("--update  <design view name>   Update the design view document stored in 'viewsDirs' with the document stored in 'couchDB'");    
    console.error("--viewsDir <path>   Directory with desgin views documents JSON files. (required)");
    console.error("--couchDB  <url>    CouchDB URL. (required)");    
}

exports.couchUpdateViews = function(){

    var _migrate = argv["migrate"];
    if(argv["migrateUp"]){
        _migrate = argv["migrateUp"];
    }
    var _update = argv["update"];

    var _viewsDir = argv["viewsDir"];

    if(argv["views"]){
        _viewsDir = argv["views"];        
    }

    var _couchDB = argv["couchDB"];    

    if(argv["couch"]){
        _couchDB = argv["couch"];
    }

    if(argv["couchdb"]){
        _couchDB = argv["couchdb"];
    }

    if(!_migrate && !_update || !_viewsDir || !_couchDB){
        help();
        process.exit(1);
    }

    run(_migrate, _update, _viewsDir, _couchDB)
    .then(function(){
        process.exit(0);
    });
    
}

exports.migrateUp = require(path.join(__dirname, "migrateUp"));
exports.updateDesignDocument = require(path.join(__dirname, "updateDesignDocument"));