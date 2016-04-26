/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var atob = require('atob');

    // TODO: quit in production
    var util = require('util');

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
                var mainContent = req.user.profile._json;
                var newTwitter = new Twitter({
                    "user": payload.email,
                    "in_use": false,
                    "token": req.user.token,
                    "secret": req.user.tokenSecret,
                    "description": mainContent.description,
                    "screen_name": mainContent.screen_name,
                    "name": mainContent.name,
                    "id_str": mainContent.id_str,
                    "location": mainContent.location,
                    "url": mainContent.url,
                    "followers_count": mainContent.followers_count,
                    "friends_count": mainContent.friends_count,
                    "favourites_count": mainContent.favourites_count,
                    "statuses_count": mainContent.statuses_count,
                    "profile_image_url": mainContent.profile_image_url,
                    "tweet_app": 0
                });
                newTwitter.save(function(err){
                    if(err){
                        // Error updating user
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "token" : req.user.token,
                                "tokenSecret": req.user.tokenSecret,
                                "errorMessage": err,
                                "url": "http://localhost:3000/twitter"
                            }
                        });
                    } else {
                        // Successful authentication
                        res.json({
                            "error": false,
                            "data": {
                                "token" : req.user.token,
                                "tokenSecret": req.user.tokenSecret,
                                "email": payload.email,
                                "url": "http://localhost:3000/twitter"
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