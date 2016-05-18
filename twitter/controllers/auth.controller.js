/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: auth.controller.js
 * Description: Controller for provide twitter authentication, necessary jwt.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var request = require('request');
    var atob = require('atob');

    module.exports = function(app) {

        // Session with Twitter
        app.get('/auth/twitter',
            passport.authenticate('twitter'));

        // Callback received from twitter
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', { failureRedirect: '/login' }),
            function(req, res) {
                if(req.session.jwt) {

                    // Gets jwt from authorization header
                    var payload = req.session.jwt.split('.')[1];
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

                    // Update user.
                    newTwitter.save(function (err) {
                        if (err) {

                            // Error updating user
                            res.redirect(process.env.CURRENT_DOMAIN + '/#/errors');
                        } else {

                            // Successful authentication
                            // Now setting as active account (using)
                            request({
                                    url: process.env.CURRENT_DOMAIN + '/twitter/' + mainContent.id_str + '/use',
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': 'Bearer ' + req.session.jwt
                                    }
                                },
                                function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    res.redirect(process.env.CURRENT_DOMAIN + "/#/twitterAccounts");
                                } else {
                                    res.redirect(process.env.CURRENT_DOMAIN + '/#/errors');
                                }
                            });
                        }
                    });
                } else {
                    // If not have jwt -> error.
                    res.redirect(process.env.CURRENT_DOMAIN + '/#/errors');
                }
            });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();