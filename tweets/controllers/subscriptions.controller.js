/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var OAuth = require('oauth').OAuth;
    var atob = require('atob');
    var User = mongoose.model('users');
    var user_required = require('../../config/policies.config').user_required;

    module.exports = function(app) {

        /**
         * Init OAuth object with the twitter application consumer key and secret.
         * It establishes a callback URL to receive Twitter response.
         * @param callback is the callback object, containing the OAuth object initialized.
         */
        function initTwitterOauth(callback) {
            var oa = new OAuth(
                "https://twitter.com/oauth/request_token"
                , "https://twitter.com/oauth/access_token"
                , process.env.TWITTER_CONSUMER_KEY
                , process.env.TWITTER_CONSUMER_SECRET
                , "1.0A"
                , "http://localhost:3000/auth/twitter/callback"
                , "HMAC-SHA1"
            );
            callback(oa);
        }

        /**
         * Converts a JWT in request to a JSON Object.
         * @param req is the request containing the JWT.
         * @param callback is the object callback, a user from database.
         * @constructor constructor.
         */
        function getUserFromJWT(req, callback){
            var payload = req.headers.authorization.split('.')[1];
            payload = atob(payload);
            payload = JSON.parse(payload);
            User.findOne({email: payload.email}, function(err, doc){
                if(err) {
                    callback(err);
                } else {
                    callback(doc);
                }
            });
        }

        /**
         * Gets user info from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param query is the query to find tweets.
         * @param callback is the callback object, containing the resultant user data (searched tweets).
         */
        function searchTweets(user, query, callback){
            initTwitterOauth(function(oa)
            {
                oa.get(
                    "https://api.twitter.com/1.1/search/tweets.json?q=" + query
                    , user.token
                    , user.secret
                    , function (error, data, response) {
                        if (error){
                            callback(error);
                        } else {
                            callback(JSON.parse(data));
                        }
                    }
                );
            });
        }

        /**
         * Gets hashtags subscriptions of current user.
         */
        app.get('/subscriptions', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                User.findOne({email: user.email}, function(err, doc){
                    if (err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot obtain subscribed terms for this user"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Obtaining subscribed terms succesful",
                                "url": "http://localhost:3000/tweets",
                                "content": doc.subscribed
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Add a new subscription (hashtag) to current user.
         */
        app.post('/subscriptions', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                User.findOneAndUpdate({email: user.email}, {$push: {subscribed: {hashtag: req.body.hashtag}}},
                    {new:true}, function(err, doc){
                        if (err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot subscribe user to: " + req.body.hashtag
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "User succesfully subscribed to: " + req.body.hashtag,
                                    "url": "http://localhost:3000/tweets",
                                    "content": doc.subscribed
                                }
                            });
                            next();
                        }
                    });
            });
        }, user_required.after);

        /**
         * Gets all statuses of hashtag in the request (using current user).
         */
        app.get('/subscriptions/:id', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                searchTweets(user, req.params.id, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot search with query: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Search successful",
                                "url": "http://localhos:3000/tweets",
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Delete a subscription (hashtag) from current user.
         */
        app.delete('/subscriptions/:id', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                User.findOneAndUpdate({email: user.email}, {$pull: {subscribed: {hashtag: "#" + req.params.id}}},
                    {new: true},
                    function(err, doc){
                        if (err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot unsubscribe user from: #" + req.params.id
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "User succesfully unsubscribed from: #" + req.params.id,
                                    "url": "http://localhost:3000/tweets",
                                    "content": doc.subscribed
                                }
                            });
                            next();
                        }
                    });
            });
        }, user_required.after);

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();