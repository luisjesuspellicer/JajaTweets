/**
 * Created by diego on 16/04/16.
 */
(function () {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
    var jwt = require('express-jwt');
    var _ = require('lodash');

    var auth = jwt({
        secret: process.env.MY_SECRET,
        userProperty: 'payload'
    });

    module.exports = function (app, route) {

        var admin_required = {
            before: [auth,function (req, res, next) { // Need to be admin
                if (req.payload && req.payload.email != "test@test") {
                    res.status(401)
                        .json({
                            "error": false,
                            "data": {
                                "message": "Insufficient privileges.",
                                "url": "localhost:3000/login"
                            }
                        })
                } else {
                    next();
                }
            }],
            after: [function (err, req, res, next) { // Need to be authenticated
                if (err && err.name === "UnauthorizedError") {
                    res.status(401).json({
                        "error": false,
                        "data": {
                            "message": "Authentication required.",
                            "url": "http://localhost:3000/singin.html"
                        }
                    })
                } else {
                    next();
                }
            }]
        };

        var admin_or_self_required = _.cloneDeep(admin_required);
        admin_or_self_required['before'][1] = function (req, res, next) { // Need to be admin
            if (req.path && req.payload) {
                var _id = req.path.substr(req.path.lastIndexOf('/')+1);
                if ( _id != req.payload._id && req.payload.email != "test@test") {
                    res.status(401)
                        .json({
                            "error": false,
                            "data": {
                                "message": "Insufficient privileges.",
                                "url": "localhost:3000/login"
                            }
                        })
                } else {
                    next();
                }

            } else {
                next();
            }
        };

        // Setup the controller for REST;
        var resource = Resource(app, '', route, app.models.users)
            .get(admin_or_self_required)
            .put(admin_or_self_required)
            .delete(admin_or_self_required)
            .index(admin_required);

        resource.register(app, 'post', '/users', createUser, resource.respond.bind(resource), admin_required);

        // Add register option
        function createUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save(function (err) {
                var token;
                token = user.generateJwt();
                return resource.setResponse(res,
                    {
                        status: 200,
                        item: {
                            "error": false,
                            "data": {
                                "token": token,
                                "url": "http://localhost:3000/"
                            }
                        }
                    }, next);
            });
        }

        // Return middleware.
        return function (req, res, next) {
            next();
        };
    };

})();