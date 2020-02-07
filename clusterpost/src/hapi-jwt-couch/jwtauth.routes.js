
module.exports = function (server, conf) {

    var handlers = require('./jwtauth.handlers')(server, conf);
    var Joi = require('@hapi/joi');

    var password = Joi.string().regex(/^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w\d/+!@#$%_-]{6,}$/);

    if(conf.password){
        password = conf.password;
    }

    var user = Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: password
    });

    var userinfo = Joi.object().keys({
        _id: Joi.string().alphanum().required(),
        _rev: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(), 
        scope: Joi.array().items(Joi.string()),
        password: Joi.forbidden(),
        type: Joi.string().valid('user').required()
    }).unknown();

    var userinfobasic = Joi.object().keys({
        _id: Joi.string().alphanum().required(),
        _rev: Joi.string().required(),
        name: Joi.string().required(),
        email: Joi.string().email().required(), 
        scope: Joi.forbidden(),
        password: Joi.forbidden(),
        type: Joi.string().valid('user').required()
    }).unknown();

    var scopes = Joi.object().keys({
        _id: Joi.string().alphanum().required(),
        _rev: Joi.string().required(),
        type: Joi.string().valid('scopes').required(),
        scopes: Joi.array().items(Joi.string()).required()
    });

    if(conf.user){
        user = conf.user;
    }

    var login = Joi.object().keys({
        email: Joi.string().email().required(),
        password: password
    });

    if(conf.login){
        login = conf.login;
    }

    /*
    *   Create user in DB. 
    */
    server.route({
        method: 'POST',
        path: '/auth/user',
        handler: handlers.createUser,
        options: {
            auth: false,
            validate: {
                query: false,
                payload: user,
                params: null
            },
            response: {
                schema: Joi.object().keys({
                    token: Joi.string().required()
                })
            },
            description: 'Create new user, add it to the database with the password encrypted.'
        }
    });

    /*
    *   Get users
    */

    server.route({
        method: 'GET',
        path: '/auth/users',
        config: {
            auth: {
                strategy: 'token',
                scope: ['admin']
            },
            handler: handlers.getUsers,
            validate: {
                query: false,
                payload: false,
                params: null
            },
            response: {
                schema: Joi.array().items(userinfo)
            },
            description: 'Get all users information'
        }
    });

    /*
    *   Admin Deletes user from DB
    */
    server.route({
        method: 'DELETE',
        path: '/auth/users',
        config: {
            auth: {
                strategy: 'token',
                scope: ['admin']
            },
            handler: handlers.deleteUser,
            validate: {
                query: false,
                payload: userinfo,
                params: null
            },
            description: 'Admin deletes user from the db'
        }
    });

    /*
    *   Update user information
    */

    server.route({
        method: 'PUT',
        path: '/auth/users',
        config: {
            auth: {
                strategy: 'token',
                scope: ['admin']
            },
            handler: handlers.updateUser,
            validate: {
                query: false,
                payload: userinfo,
                params: null
            },
            response: {
                schema: Joi.object()
            },
            description: 'Admin update user'
        }
    });

    /*
    *   Update user information
    */

    server.route({
        method: 'PUT',
        path: '/auth/user',
        config: {
            auth: {
                strategy: 'token',
                scope: ['default']
            },
            handler: handlers.updateUserBasic,
            validate: {
                query: false,
                payload: userinfobasic,
                params: null
            },
            response: {
                schema: Joi.object()
            },
            description: 'User updates itself'
        }
    });

    /*
    *   Get user
    */

    server.route({
        method: 'GET',
        path: '/auth/user',
        config: {
            auth: {
                strategy: 'token',
                scope: ['default']
            },
            handler: handlers.getUser,
            validate: {
                query: false,
                payload: false,
                params: null
            },
            response: {
                schema: userinfo
            },
            description: 'Get user information'
        }
    });

    /*
    *   Delete user from DB
    */
    server.route({
        method: 'DELETE',
        path: '/auth/user',
        config: {
            auth: {
                strategy: 'token',
                scope: ['default']
            },
            handler: handlers.deleteUser,
            validate: {
                query: false,
                payload: false,
                params: null
            },
            description: 'Delete user from the db'
        }
    });

    /*
    * User login
    */
    server.route({
        method: 'POST',
        path: '/auth/login',
        config: {
            auth: false,
            validate: {
                query: false,
                payload: login,
                params: null
            },
            handler: handlers.login,
            response: {
                schema: Joi.object().keys({
                    token: Joi.string().required()
                })
            }
        }
    });

    /*
    * Update password, user must have a valid jwt token
    */
    server.route({
        method: 'PUT',
        path: '/auth/login',
        config: {
            auth: {
                strategy: 'token',
                scope: ['default']
            },
            validate: {
                query: false,
                payload: {
                    password: password
                },
                params: null
            },
            handler: handlers.loginUpdate,
            response: {
                schema: Joi.object().keys({
                    token: Joi.string().required()
                })
            },
            description: 'Update user password.'
        }
    });

    server.route({
        method: 'POST',
        path: '/auth/reset',
        config: {
            auth: false,
            validate: {
                query: false,
                payload: Joi.object().keys({
                    email: Joi.string().email().required()
                }),
                params: null
            },
            handler: handlers.resetPassword,
            description: 'Send user an email with a token. The token is valid for 30 min and it can be used to change the password.'
        }
    });

    /*
    *   Get scopes
    */

    server.route({
        method: 'GET',
        path: '/auth/scopes',
        config: {
            auth: {
                strategy: 'token',
                scope: ['default']
            },
            handler: handlers.getScopes,
            validate: {
                query: false,
                payload: false,
                params: null
            },
            // response: {
            //     schema: Joi.array().items(scopes)
            // },
            description: 'Get all scopes'
        }
    });

    /*
    *   Update scopes
    */

    server.route({
        method: 'PUT',
        path: '/auth/scopes',
        config: {
            auth: {
                strategy: 'token',
                scope: ['admin']
            },
            handler: handlers.updateScopes,
            validate: {
                query: false,
                payload: scopes,
                params: null
            },
            description: 'Update scope list'
        }
    });
}