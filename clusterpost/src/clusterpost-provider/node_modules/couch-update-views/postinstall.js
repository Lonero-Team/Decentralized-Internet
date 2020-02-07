var fs = require('fs');
var path = require('path');

var cwd = process.cwd();
var installdir = path.join(process.cwd(), "../../");

try{
	var stats = fs.statSync(path.join(installdir, 'couchUpdateViews.js'));
}catch(e){
	console.log("Generating default 'couchUpdateViews.js' script...");
	fs.writeFileSync(path.join(installdir, 'couchUpdateViews.js'), fs.readFileSync(path.join(cwd, "couchUpdateViews.js.in")));
}