# couch-update-views


- Do you use git and would like to maintain a copy of your couchdb view's code in your repository?
- Do you have multiple couchdb to maintain (production, development)?

couch-update-views allows you to synchronize design views from a local directory to your couch database. 
It will also help you update the JSON document of a view in your local directory with the view's content in the database. 


## Installing couch-update-views

----
	npm install couch-update-views
----

## Running couch-update-views: 

### Generate a script

Name your script, ex: couchUpdateViews.js and add the following lines:

----
	var couchUpdateViews = require('couch-update-views');
	couchUpdateViews.couchUpdateViews();
----

You should see the following output:

----
    node couchUpdateViews.js --migrate | --update <design view name>
    Options:
	    --migrate    Migrate design documents in couchdb. The 'design views' in couchdb are updated with the contents of the 'viewsDir' folder if they differ.
	    --update  <design view name>   Update the design view document stored in 'viewsDirs' with the document stored in 'couchDB'    
	    --viewsDir <path>   Directory with desgin views documents JSON files. (required)
	    --couchDB  <url>    CouchDB URL. (required)
----

### Synchronize the DB with the folder content

----
	node couchUpdateViews.js --migrate --viewsDir /path/to/views/folder --couchDB http://localhost:5984/dbname
----

If the dbname does not exist, it will create the db for you and add all the views for you. 

### Update a view

Generate your view using couchdb utils. If you are running couchdb locally and using the default port visit:

----
	http://localhost:5984/_utils/database.html?dbname/_temp_view
----

- Write the view's code: 

In the 'Map Function' box add:

----
	function(doc){
		if(doc.type === "user"){
			emit(doc.email, doc.name);
		}
	}
----

- Save the view using 'Save As...' button

Design document: _design/searchUser

View Name: email

- Update the view's content in your local folder:

----
	node couchUpdateViews.js --viewsDir /path/to/views/folder --couchDB http://localhost:5984/dbname --update searchUser
----

The output of this command yields a file named 'searchUser.json' located at '--viewsDir' folder. 
The content of the file should look like:

----
	{
	    "_id": "_design/searchUser",
	    "language": "javascript",
	    "views": {
	        "email": {
	            "map": "function(doc) {\n\tif(doc.type === \"user\"){\n\t\temit(doc.email, doc.name);\n\t}\n}"
	        }
	    }
	}
----

## Using couch-update-views w/o command line

## Synchronize the DB with the folder content

----
	var couchUpdateViews = require('couch-update-views');
	couchUpdateViews.migrateUp('http://localhost:5984/dbname', '/path/to/views')//DB URL, your local folder with views
	.then(function(res){
		console.log(res);//result of the operation
	});
----

### Update a view

----
	var couchUpdateViews = require('couch-update-views');
	couchUpdateViews.updateDesignDocument('http://localhost:5984/dbname', '/path/to/views', 'searchUser')//DB URL, local folder, view name
	.then(function(res){
		console.log(res);//result of operation
	});
----


## Use case example when starting your server application

In this example, I'm using [Hapi](hapijs.com) as my server. 
The plugin configuration has the couchdb url.

----
	conf = {
		"couchdb": "http://localhost:5984/somedb",
		"dirname": "/local/path/to/views"
	}
----

----

	module.exports = function (server, conf) {
		
		var couchUpdateViews = require('couch-update-views');
		var path = require('path');

		/*
		*	@params couchdb, url of couchdb
		*	@params dirname, path to directory containing the json documents of views
		*	@params test, boolean to specify if it should test for differences in the view. If true, a message will be print indicating that there are differences *	in the documents. If false or undefined, whenever there are differences in the document, the view will be pushed to couchdb. 
		*/
		couchUpdateViews.migrateUp(conf.couchdb, conf.dirname, true)
		.then(function(res){
			console.log(res);//result of the operation
		});

		//Other server logic, routes etc.
	}

	
---- 