### hapi-auth-jwt

[**hapi**](https://github.com/spumko/hapi) JSON Web Token (JWT) authentication plugin

[![Build Status](https://travis-ci.org/ryanfitz/hapi-auth-jwt.png?branch=master)](https://travis-ci.org/ryanfitz/hapi-auth-jwt)

JSON Web Token authentication requires verifying a signed token. The `'jwt'` scheme takes the following options:

- `key` - (required) The private key the token was signed with.
- `validateFunc` - (optional) validation and user lookup function with the signature `function(request, token, callback)` where:
    - `request` - is the hapi request object of the request which is being authenticated.
    - `token` - the verified and decoded jwt token
    - `callback` - a callback function with the signature `function(err, isValid, credentials)` where:
        - `err` - an internal error.
        - `isValid` - `true` if the token was valid otherwise `false`.
        - `credentials` - a credentials object passed back to the application in `request.auth.credentials`. Typically, `credentials` are only
          included when `isValid` is `true`, but there are cases when the application needs to know who tried to authenticate even when it fails
          (e.g. with authentication mode `'try'`).
- `verifyOptions` - settings to define how tokens are verified by the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) library
    - `algorithms`: List of strings with the names of the allowed algorithms. For instance, `["HS256", "HS384"]`.
    - `audience`: if you want to check audience (`aud`), provide a value here
    - `issuer`: if you want to check issuer (`iss`), provide a value here
    - `ignoreExpiration`: if `true` do not validate the expiration of the token.
    - `maxAge`: optional sets an expiration based on the `iat` field. Eg `2h`

See the example folder for an executable example.

```javascript

var Hapi = require('hapi'),
    jwt = require('jsonwebtoken'),
    server = new Hapi.Server();

server.connection({ port: 8080 });


var accounts = {
    123: {
        id: 123,
        user: 'john',
        fullName: 'John Doe',
        scope: ['a', 'b']
    }
};


var privateKey = 'BbZJjyoXAdr8BUZuiKKARWimKfrSmQ6fv8kZ7OFfc';

// Use this token to build your request with the 'Authorization' header.  
// Ex:
//     Authorization: Bearer <token>
var token = jwt.sign({ accountId: 123 }, privateKey, { algorithm: 'HS256'} );


var validate = function (request, decodedToken, callback) {

    var error,
        credentials = accounts[decodedToken.accountId] || {};

    if (!credentials) {
        return callback(error, false, credentials);
    }

    return callback(error, true, credentials)
};


server.register(require('hapi-auth-jwt'), function (error) {

    server.auth.strategy('token', 'jwt', {
        key: privateKey,
        validateFunc: validate,
        verifyOptions: { algorithms: [ 'HS256' ] }  // only allow HS256 algorithm
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'token'
        }
    });

    // With scope requirements
    server.route({
        method: 'GET',
        path: '/withScope',
        config: {
            auth: {
                strategy: 'token',
                scope: ['a']
            }
        }
    });
});


server.start();

```