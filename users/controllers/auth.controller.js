/**
 * Created by diego on 21/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');

    module.exports = function(app) {

        app.post('/login',function(req, res, next) {
            passport.authenticate('local', function(err, user, info){
                var token;

                // If Passport throws/catches an error
                if (err) {
                    res.status(404).json(err);
                    return;
                }

                // If a user is found
                if(user){
                    token = user.generateJwt();
                    res.status(200);
                    res.json({
                        "error": false,
                        "data": {
                            "token" : token,
                            "url": "http://localhost:3000/"
                        }
                    });
                } else {
                    // If user is not found
                    res.status(401).json(info);
                }
            })(req, res);
        });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();