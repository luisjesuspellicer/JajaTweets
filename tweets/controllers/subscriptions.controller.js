/**
 * Created by piraces on 22/4/16.
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
         * Gets hashtags subscriptions of current user.
         *
         * (Checked)
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
         * Add a new subscription (hashtag) to current user.
         *
         * (Checked)
         */
        app.post('/subscriptions', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(req.body.hashtag) {
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
                                    if (err) {
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
                            "message": "Hashtag not provided (mandatory field)",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        /**
         * Gets all statuses of hashtag in the request (using current user).
         *
         * (Checked)
         */
        app.get('/subscriptions/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                // Encode id for URL parameters
                var id = encodeURIComponent(req.params.id).replace(/\(/g, "%28").replace(/\)/g, "%29");
                TweetCommons.searchTweets(user, id, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot search with query: " + req.params.id,
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Search successful",
                                "url": process.env.CURRENT_DOMAIN + "/tweets",
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
         *
         * (Checked)
         */
        app.delete('/subscriptions/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                var id = decodeURIComponent(req.params.id);
                Twitter.findOneAndUpdate({user: user.user, in_use: true}, {$pull: {subscribed: {hashtag: id}}},
                    {new: true},
                    function(err, doc){
                        if (err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot unsubscribe user from: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "User succesfully unsubscribed from: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN + "/tweets",
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