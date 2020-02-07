var cuv = require('couch-update-views');

var env = process.env.NODE_ENV;

if(!env) throw 'Please set NODE_ENV variable.';


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

var clusterpostProvider = conf.plugins['clusterpost-provider'];
var clusterjobs = clusterpostProvider.dataproviders[clusterpostProvider.default.dataprovider]
var couchdb = clusterjobs.hostname + '/' + clusterjobs.database;

var views = path.join('./src/clusterpost-server/', './views');

cuv.migrateUp(couchdb, views)
.then(function(res){
    console.log(res);
    process.exit(0);
})
.catch(function(err){
    console.log(error);
    process.exit(1);
});