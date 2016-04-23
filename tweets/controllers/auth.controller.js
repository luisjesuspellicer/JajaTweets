/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var util = require('util');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
    var atob = require('atob');

    module.exports = function(app) {

        // Session with Twitter
        app.get('/auth/twitter',
            passport.authenticate('twitter'));

        // Callback received from twitter
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', { failureRedirect: '/login' }),
            function(req, res) {
                // Gets jwt from authorization header
                var payload = req.headers.authorization.split('.')[1];
                payload = atob(payload);
                payload = JSON.parse(payload);
                User.findOneAndUpdate({email: payload.email}, {$set:{token:req.user.token, secret: req.user.tokenSecret}},
                    {new: false}, function(err, doc){
                    if(err){
                        // Error updating user
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "token" : req.user.token,
                                "tokenSecret": req.user.tokenSecret,
                                "errorMessage": err,
                                "url": "http://localhost:3000/tweets"
                            }
                        });
                    } else {
                        // Successful authentication, redirect home.
                        res.status(200).json({
                            "error": false,
                            "data": {
                                "token" : req.user.token,
                                "tokenSecret": req.user.tokenSecret,
                                "username": doc.name,
                                "url": "http://localhost:3000/tweets"
                            }
                        });
                    }
                });
            });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();