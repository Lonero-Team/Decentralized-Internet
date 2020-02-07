var fs = require('fs');
var path = require('path');

var cwd = process.cwd();
var installdir = path.join(process.cwd(), "../../");

var index = fs.readFileSync(path.join(cwd, "index.js.in"));

try{
	var stats = fs.statSync(path.join(installdir, 'index.js'));
}catch(e){
	console.log("Generating default index file at:", installdir, "index.js");
	console.log("Please edit this file with your configuration parameters.");
	fs.writeFileSync(path.join(installdir, 'index.js'), index);

	var defaultconfig = fs.readFileSync(path.join(cwd, "conf.json.in"));

	try{
		var stats = fs.statSync(path.join(installdir, 'conf.json'));
	}catch(e){
		console.log("Generating default configuration file at", installdir, "conf.json");
		console.log("Please edit this file with your configuration parameters.");
		fs.writeFileSync(path.join(installdir, 'conf.json'), defaultconfig);
	}
}



