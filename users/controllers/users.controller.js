/**
 * Created by diego on 16/04/16.
 */
(function() {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
    var jwt = require('express-jwt');


    module.exports = function(app, route) {

        var with_auth = {
            before: jwt({
                secret: process.env.MY_SECRET,
                userProperty: 'payload'
            }),
            after: function (err, req, res, next) {
                if (err && err.name === "UnauthorizedError") {
                    res.status(401).json({
                        'error': false,
                        'message': 'Authentication required.',
                        'login': 'localhost:3000/login'
                    });
                }
            }
        };

        // Setup the controller for REST;
        Resource(app, '', route, app.models.users)
            .get(with_auth)
            .put(with_auth)
            .delete(with_auth)
            .index(with_auth);

        // Add register option
        app.post('/users',function(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save(function(err) {
                var token;
                token = user.generateJwt();
                res.status(200);
                res.json({
                    "token" : token
                });
            });
        });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();