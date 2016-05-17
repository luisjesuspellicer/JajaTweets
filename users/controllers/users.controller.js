/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: users.controller.js
 * Description: This file contains all the endpoints offered for the resource 'users'.
 * It's a restful api.
 *      GET,POST            /users
 *      GET,PUT,DELETE      /users/:id
 *      GET                 /users/:filter
 */
(function () {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
    var Twitter = mongoose.model('twitter');
    var Tweets = mongoose.model('tweets');
    var Shortened = mongoose.model('shortened');
    var http = require('http');
    var _ = require('lodash');
    var jwt = require('jsonwebtoken');

    module.exports = function (app, route) {

        // First load the policies that will be used in the endpoints
        var admin_required = require('../../config/policies.config').admin_required;
        var admin_or_self_required = require('../../config/policies.config').admin_or_self_required;
        // Delete operation should update Analytics
        var delete_options = _.cloneDeep(admin_or_self_required);
        delete_options.after.push(function (req, res, next) {
            updateUsers(-1, jwt.sign(req.payload, process.env.MY_SECRET));
            next(); }
        );

        var index_options = _.cloneDeep(admin_required);
        index_options.after.push(function(req, res, next) {
            if (res.resource.item) {
                res.resource.item.forEach(function(user) {
                    user.url = process.env.CURRENT_DOMAIN + '/users/' + user._id
                })
            }
            next();
        });

        // Available filters
        var filters = ["tweets","last"];


        // Setup the controller for REST
        var resource = Resource(app, '', route, app.models.users)
            .delete(delete_options) // DELETE /users/:id
            .index(index_options); // GET /users

        // GET /users returns all the users
        resource.register(app,'get','/users/:id',getUser, resource.respond.bind(resource), admin_or_self_required);
        // POST /users must generate new user/password
        resource.register(app, 'post', '/users', createUser, resource.respond.bind(resource), admin_required);
        // PUT /users/:id updates user by id
        resource.register(app, 'put', '/users/:id', updateUser,resource.respond.bind(resource), admin_or_self_required);
        // GET /users/:filter applies a filter to the users list
        resource.register(app, 'get', '/users/:filter', filterUsers, resource.respond.bind(resource), admin_required);

        function getUser(req, res, next) {
            if (filters.indexOf(req.params.id)>-1) {
                next();
            } else {
                User.findById(req.params.id, function(err,docs) {
                    if(err){
                        return resource.setResponse(res,
                            {
                                status: 500,
                                item: {
                                    "error": true,
                                    "data": {
                                        "message": "Cannot get user info",
                                        "url": process.env.CURRENT_DOMAIN + "/users"
                                    }
                                }
                            }, next);
                    } else {
                        return resource.setResponse(res,
                            {
                                status: 200,
                                item: {
                                    "error": false,
                                    "data": docs
                                }
                            }, next);
                    }
                })

            }
        }

        /**
         * Applies a filter to the users list
         */
        function filterUsers(req, res, next) {
            if (filters.indexOf(req.params.filter)<0) {
                next();
            } else {
                switch (req.params.filter) {
                    case "tweets":
                        getMoreTweets(req, res, next);
                        break;
                    case "last":
                        getLastUsers(req, res, next);
                        break;
                }
            }
        }

        /**
         * Create a new user and returns a JWT token, token could be changed so /login required.
         */
        function createUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;
            user.lastAccess = new Date();
            // Creates a random initial password
            var password = make_passwd(13, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');

            user.setPassword(password);

            user.save(function (err) {
                var token;
                token = user.generateJwt();
                updateUsers(1,token);
                return resource.setResponse(res,
                    {
                        status: 200,
                        item: {
                            "error": false,
                            "data": {
                                "password": password,
                                "url": process.env.CURRENT_DOMAIN + "/login"
                            }
                        }
                    }, next);
            });
        }

        /**
         * Updates a user and returns a JWT token, token could be changed so /login required.
         * @param req
         * @param res
         * @param next
         */
        function updateUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;
            user.lastAccess = new Date();
            var password = req.body.password;

            user.setPassword(password);
            if(req.body.name && req.body.email && req.body.password && req.body.oldEmail){
                // Updates all data of specified user
                User.update({email: req.body.oldEmail}, {$set: {email: user.email, name: user.name, hash: user.hash,
                    salt: user.salt, lastAccess: user.lastAccess}}, function (err, doc) {
                    if(err){
                        return resource.setResponse(res,
                            {
                                status: 500,
                                error:{
                                    message: "Cannot update this user"
                                },
                                item: {
                                    "error": true,
                                    "data": {
                                        "message": "Cannot update this user",
                                        "url": process.env.CURRENT_DOMAIN + "/users"
                                    }
                                }
                            }, next);
                    } else {
                        // Updates all other linked resources of user
                        multiUpdate(req, user, function (err) {
                            if (err) {
                                return resource.setResponse(res,
                                    {
                                        status: 500,
                                        error:{
                                            message: "Cannot update this user"
                                        },
                                        item: {
                                            "error": true,
                                            "data": {
                                                "message": "Cannot update this user",
                                                "url": process.env.CURRENT_DOMAIN + "/users"
                                            }
                                        }
                                    }, next);
                            } else {
                                return resource.setResponse(res,
                                    {
                                        status: 200,
                                        item: {
                                            "error": false,
                                            "data": {
                                                "message": "Update user successful",
                                                "password": password,
                                                "url": process.env.CURRENT_DOMAIN + "/login"
                                            }
                                        }
                                    }, next);
                            }
                        });
                    }
                });
            } else {
                return resource.setResponse(res,
                    {
                        status: 400,
                        error:{
                            message: "Cannot update this user"
                        },
                        item: {
                            "error": true,
                            "data": {
                                "message": "Cannot update this user",
                                "url": process.env.CURRENT_DOMAIN + "/users"
                            }
                        }
                    }, next);
            }
        }

        /**
         * Updates all resources associated with the specified user, with the new email in req.
         * @param req is the request object.
         * @param user is the user object.
         * @param callback is the callback object.
         */
        function multiUpdate(req, user, callback){
            // Updates all twitter data of specified user
            Twitter.update({user: req.body.oldEmail}, {$set: {user: user.email}}, {multi: true},
                function (err, doc) {
                    if(err){
                        callback(true);
                    } else {
                        // Updates all tweets data of specified user
                        Tweets.update({user: req.body.oldEmail}, {$set: {user: user.email}}, {multi: true},
                            function (err, doc) {
                                if(err){
                                    callback(true);
                                } else {
                                    // Updates all shortened data of specified user
                                    Shortened.update({user: req.body.oldEmail}, {$set: {user: user.email}},
                                        {multi: true}, function (err, doc) {
                                            if(err){
                                                callback(true);
                                            } else {
                                                callback();
                                            }
                                        });
                                }
                            });
                    }
                });
        }

        /**
         * Creates a random password using an array of characters and a maximum length.
         * @param n is the maximum length.
         * @param a are the characters array to combine to create the password.
         * @returns {string} with the generated password.
         */
        make_passwd = function(n, a) {
            var index = (Math.random() * (a.length - 1)).toFixed(0);
            return n > 0 ? a[index] + make_passwd(n - 1, a) : '';
        };

        // Return middleware.
        return function (req, res, next) {
            next();
        };
    };

    /**
     * Returns the last access list, with 20 users.
     * @param req
     * @param res
     * @param next
     */
    function getLastUsers(req, res, next) {

            User.find({}).sort({lastAccess: -1}).limit(20).exec(
                function (err, users) {
                    res.status(200).json(users);
                }
            );

    }

    /**
     * Returns the users with more tweets.
     * @param req
     * @param res
     * @param next
     */
    function getMoreTweets(req, res, next) {

            User.find({}).sort({tweets_app: -1}).limit(20).exec(
                function (err, users) {
                    res.status(200).json(users);
                }
            );

    }

    /**
     * Uses the Analytics API so as to update "subunsub" data.
     * @param {Numeric} num
     * @param {String} token
     */
    function updateUsers(num,token) {
        http.request({ method: 'get',  port: 3000,  path:'/data',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer '+token
            }
        }, function (res) {
            var result = "";
            res.on('data', function (chunk) {
                result += chunk.toString();
            });
            res.on('end', function() {
                var i = -1;

                var data = JSON.parse(result);
                do {
                    i++;
                    if (data[i].name == "subunsub") {
                        if (num>0) data[i].chart[0]++;
                        else { data[i].chart[1]++ }
                        var req = http.request({ method: 'put',  port: 3000,  path:'/data/'+data[i]._id,
                            headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer '+token
                            }
                        });
                        req.write(JSON.stringify(data[i]));
                        req.end();
                    }
                } while (i < data.length && data[i].name != "subunsub");
            })
        }).end();
    }

})();