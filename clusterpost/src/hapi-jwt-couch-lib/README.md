# hapi-jwt-couch

Hapi plugin to validate users using [hapi-auth-jwt](https://github.com/ryanfitz/hapi-auth-jwt), storing user information and encrypted passwords 
in a couchdb instance. 

This plugin also provides a 'recover my password' option by setting up an email account using [nodemailer](https://github.com/nodemailer/nodemailer).

Edit the "message" portion of the configuration. The strings @USERNAME@, @SERVER@ and @TOKEN@ are replaced before sending the email. 

## Usage 

----
	npm install hapi-jwt-couch-lib
----

### Usage and available functions implemented with promises

----
	var hapijwtcouch = require("hapi-jwt-couch-lib");
----

#### setServer

Set the server uri ex. 

----
	hapijwtcouch.setServer('http://localhost:9090');
----

#### getServer

Returns the server uri

----
	var serveruri = hapijwtcouch.getServer();
	console.log(serveruri);// http://localhost:9090
----

#### setAgentOptions

Set the request object with specific options documentation at https://www.npmjs.com/package/request

----
	//When using an https connection and you don't want to set the certificate. 
	var agentoptions = {
		rejectUnauthorized: false
	}
	hapijwtcouch.setAgentOptions(agentoptions);
----

#### promptUsernamePassword()

Use a terminal to prompt for user name and password

----	
	hapijwtcouch.promptUsernamePassword()
	.then(function(user){
		console.log(user);//{'email': 'email@email.com', 'password': 'password'}
	});
----

#### promptServer

Use the terminal to prompt for server URI

----	
	hapijwtcouch.promptServer()
	.then(function(server){
		console.log(server);//{'uri': 'http://localhost:9090'}
	});
----

#### start

Function to prompt for username, password and server. It will login the user as well. 
After login, you may execute any other operation. 

----	
	hapijwtcouch.start()
	.then(function(res){
		console.log(res);//{'token': 'usertoken'}
	});
----

#### setUserToken

Set the user authentication token to use the request library

----
	hapijwtcouch.setUserToken({'token': 'sometoken'});
----

#### getUserToken

Gets the user token

----
	var token = hapijwtcouch.getUserToken(); 
	console.log(token);//{'token': 'sometoken'}
----

#### createUser

Creates a user in the database

----
	hapijwtcouch.createUser({
	    name: 'name',
		userEmail: 'email@email.com',
		password: 'password'
	});
----

#### resetPassword

Sends an email to recover the password with a link

----
	hapijwtcouch.resetPassword({email: 'email@email.com'}).
	then(function(response){
		console.log(response);//'An email has been sent to recover your password.'
	});
----

#### userLogin

Logs in the user and returns a token

----
	hapijwtcouch.userLogin({email: 'email@email.com', password: 'somepassword'}).
	then(function(response){
		console.log(response);//{token: 'JWTusertoken'}
	});
----

#### getUser

Gets the user currently logged in the application.

----
	hapijwtcouch.getUser().
	then(function(user){
		console.log(user);
		//		{ _id: 'b5b17dc4968b2382a4f778e8c600049a',
		// 		  _rev: '4-55f9ec8dfcf949155ed8ece07bc2a388',
		// 		  name: 'User name',
		// 		  email: 'email@email.com',
		// 		  type: 'user',
		// 		  scope: [ 'default', 'admin' ] 
		// 		}
		//You can add any additional field to the user document, the shown above are default ones
	});
----

#### getUsers

Gets all the users in the database uses admin scope

----
	//Must be admin
	hapijwtcouch.getUsers().
	then(function(response){
		console.log(response);//array of users
	});
----

#### updateUser

Update basic user information

----
	//we are going to update the user information by adding the field projects

	hapijwtcouch.getUser()
	.then(function(user){
		user.projects = [{"somenewstuff": "new"}];
		//NOTE: The field scope will be deleted from this update. The admin user is the only one that 
		//can modify the 'scope' of the user. Use the function 'updateUsers' to modify the scope.
		return hapijwtcouch.updateUser(user);
	})
	.then(function(response){
		console.log(response);
	});
----

#### updateUsers

The user must have admin scope. 

----
	//we are going to make another user admin

	hapijwtcouch.getUsers()
	.then(function(users){
		var user = users[0]; //Find user in array
		user.scope = ['default', 'admin'];		
		return hapijwtcouch.updateUser(user);
	})
	.then(function(response){
		console.log(response);
	});
----

#### deleteUser

Deletes self from the DB

----
	hapijwtcouch.deleteUser()
	.then(function(response){
		console.log(response);
	});
----

#### deleteUsers

Deletes a user from the DB, must be admin

----
	hapijwtcouch.deleteUsers(user)
	.then(function(response){
		console.log(response);
	});
----

## Testing 

### Start the test server

----
	node testserver.js
----

### Run all tests

----
	npm test
----

