/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: subscriptions.controller.js
 * Description: This file contains functions on the "subscriptions" resource and declare endpoints for the interaction
 * with this resource.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var atob = require('atob');
    var Twitter = mongoose.model('twitter');
    var user_required = require('../../config/policies.config').user_required;
    var TweetCommons = require('../../common/tweets');

    module.exports = function(app) {

        

        /**
         * Gets hashtags (or other queries) subscriptions of current user (in use Twitter account of local user).
         * Returns a list of subscriptions (containing the query).
         */
        app.get('/subscriptions', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if (user) {
                    Twitter.findOne({user: user.user, in_use: true}, function(err, doc){
                        if (err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot obtain subscribed terms for this user",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else if(!doc.subscribed) {
                            res.status(404).json({
                                "error": true,
                                "data" : {
                                    "message": "No subscriptions for current user",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "Obtaining subscribed terms succesful",
                                    "url":  process.env.CURRENT_DOMAIN + "/tweets",
                                    "content": doc.subscribed
                                }
                            });
                            next();
                        }
                    });
                } else {
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Cannot obtain subscribed terms for this user",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    })
                }

            });
        }, user_required.after);

        /**
         * Adds a new subscription (hashtag or other query) to current user.
         * Body parameters required:
         * - hashtag: query to subscribe the user.
         */
        app.post('/subscriptions', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(req.body.hashtag && user) {
                    Twitter.findOne({user: user.user, in_use: true, subscribed: {hashtag: req.body.hashtag}},
                        function (err, doc) {
                        if (err) {
                            res.status(500).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot subscribe user to: " + req.body.hashtag,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else if (doc != null) {
                            res.status(400).json({
                                "error": true,
                                "data": {
                                    "message": "User is already subscribed to: " + req.body.hashtag,
                                    "url": process.env.CURRENT_DOMAIN,
                                    "content": doc.subscribed
                                }
                            });
                            next();
                        } else {
                            Twitter.findOneAndUpdate({user: user.user, in_use: true}, {$push: {subscribed:
                                {hashtag: req.body.hashtag}}},
                                {new: true}, function (err, doc) {
                                    if (err || doc==null) {
                                        res.status(500).json({
                                            "error": true,
                                            "data": {
                                                "message": "Cannot subscribe user to: " + req.body.hashtag,
                                                "url": process.env.CURRENT_DOMAIN
                                            }
                                        });
                                        next();
                                    } else {
                                        res.json({
                                            "error": false,
                                            "data": {
                                                "message": "User succesfully subscribed to: " + req.body.hashtag,
                                                "url": process.env.CURRENT_DOMAIN + "/tweets",
                                                "content": doc.subscribed
                                            }
                                        });
                                        next();
                                    }
                                });
                        }
                    });
                } else {
                    res.json({
                        "error": true,
                        "data": {
                            "message": "Hashtag or user not provided (mandatory data)",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        /**
         * Gets all statuses of query in the request (using current user credentials).
         * Returns Tweets from Twitter containing the query, using the Twitter search API.
         * id: the query for searching in Twitter.
         */
        app.get('/subscriptions/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user) {
                    // Encode id for URL parameters
                    var id = encodeURIComponent(req.params.id).replace(/\(/g, "%28").replace(/\)/g, "%29");
                    TweetCommons.searchTweets(user, id, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            // Twitter API interaction error.
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot search with query: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data": {
                                    "message": "Search successful",
                                    "url": process.env.CURRENT_DOMAIN + "/tweets",
                                    "content": result
                                }
                            });
                            next();
                        }
                    });
                } else {
                    res.status(500).json({
                        "error": true,
                        "data": {
                            "message": "Cannot get current user in use",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        /**
         * Delete a subscription (hashtag or other query) from current user, identified with unique id.
         * - id: query to unsubscribe the user from,.
         */
        app.delete('/subscriptions/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if (user) {
                    var id = decodeURIComponent(req.params.id);
                    Twitter.findOneAndUpdate({user: user.user, in_use: true}, {$pull: {subscribed: {hashtag: id}}},
                        {new: true},
                        function (err, doc) {
                            if (err || doc==null) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot unsubscribe user from: " + req.params.id,
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                                next();
                            } else {
                                res.json({
                                    "error": false,
                                    "data": {
                                        "message": "User succesfully unsubscribed from: " + req.params.id,
                                        "url": process.env.CURRENT_DOMAIN + "/tweets",
                                        "content": doc.subscribed
                                    }
                                });
                                next();
                            }
                        });
                } else {
                    res.status(500).json({
                        "error": true,
                        "data": {
                            "message": "Cannot get current user in use",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();