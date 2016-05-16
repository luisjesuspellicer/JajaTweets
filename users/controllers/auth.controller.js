/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: auth.controller.js
 * Description: This file contains functions to manage the login endpoint.
 */
(function() {

    'use strict';

    var passport = require('passport');

    module.exports = function(app) {

        /**
         * Logout current user by destroying session and expiring correspondent cookies.
         * After execution, user has to login again for new JWT to use in further interactions.
         */
        app.get('/logout', function(req,res,next) {
            req.session.cookie.expires = new Date(1);
            req.session.cookie.maxAge = 1;
            req.session.destroy(function(err) {
                // Session destroyed
            });
            res.status(200).json({error: false, content:{message: "Successful logout"}});
        });

        /**
         * Offers the endpoint POST /login, where user can start a session to interact with the other system endpoints.
         * Uses passport to authenticate the user and returns a valid JWT.
         */
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
                    user.lastAccess = new Date();
                    user.save();
                    res.status(200);
                    req.session.jwt = token;
                    res.json({
                        "error": false,
                        "data": {
                            "token" : token,
                            "url": process.env.CURRENT_DOMAIN + "/tweets"
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