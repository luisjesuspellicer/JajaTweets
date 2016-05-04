/**
 * Created by diego on 16/04/16.
 *
 * Contains all the endpoints offered for the resource 'users'.
 * It is a restful api.
 *      GET,POST            /users
 *      GET,PUT,DELETE      /users/:id
 *      GET                 /users::last
 */
(function () {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
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

        // Setup the controller for REST
        var resource = Resource(app, '', route, app.models.users)
            .get(admin_or_self_required) // GET /users/:id
            .put(admin_or_self_required)// PUT /users/:id
            .delete(delete_options) // DELETE /users/:id
            .index(index_options); // GET /users

        // POST /users must generate new JWT token
        resource.register(app, 'post', '/users', createUser, resource.respond.bind(resource), admin_required);
        // GET /users::last offers the last accesses
        resource.register(app, 'get', '/users::last', getLastUsers, resource.respond.bind(resource), admin_required);
        // GET /users::tweets offers users with more tweets
        resource.register(app, 'get', '/users::tweets', getMoreTweets, resource.respond.bind(resource), admin_required);

        /**
         * Create a new user and returns a JWT token, token could be
         * changed so /login required.
         * @param req
         * @param res
         * @param next
         */
        function createUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;
            user.lastAccess = new Date();
            var password = make_passwd(13, 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890');
            console.log(password);

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
            function(err, users) {
                res.status(200).json(users);
            }
        );
    }

    /**
     * Returns the users with more tweets
     * @param req
     * @param res
     * @param next
     */
    function getMoreTweets(req, res, next) {
        User.find({}).sort({tweets_app: -1}).limit(20).exec(
            function(err, users) {
                res.status(200).json(users);
            }
        );
    }

    /**
     * Uses the Analytics API so as to update subunsub data
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