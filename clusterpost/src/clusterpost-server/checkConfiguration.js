var fs = require('fs');
var path = require('path');

var cwd = process.cwd();
var installdir = path.join(process.cwd(), "../../");

var defaultconfig = fs.readFileSync(path.join(cwd, "conf.default.json"));

try{
	var stats = fs.statSync(path.join(installdir, 'conf.production.json'));
}catch(e){
	console.log("Generating default 'production' configuration file...");
	console.log("Please edit this file with your configuration parameters.");
	fs.writeFileSync(path.join(installdir, 'conf.production.json'), defaultconfig);
}

try{
	var stats = fs.statSync(path.join(installdir, 'conf.test.json'));	
}catch(e){
	console.log("Generating default 'test' configuration file...");
	console.log("Please edit this file with your configuration parameters.");
	fs.writeFileSync(path.join(installdir, 'conf.test.json'), defaultconfig);
}

try{

	var migrateUp = fs.readFileSync(path.join(cwd, "migrateUp.js.in"));
	migrateUp.replace("@DIRNAME@", cwd);

	fs.writeFileSync(path.join(installdir, 'migrateUp.js'), migrateUp);

}catch(e){

}

try{

	var stats = fs.statSync(path.join(installdir, 'index.js'));

}catch(e){

	console.log("Generating default 'index.js' start script");
	console.log("Please edit this file and add your own plugins");
	
	var index = fs.readFileSync(path.join(cwd, "index.js"));
	fs.writeFileSync(path.join(installdir, 'index.js'), index);

}
