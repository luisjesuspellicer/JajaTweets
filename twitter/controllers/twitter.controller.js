/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: twitter.controller.js
 * Description: Controller for provide Twitter accounts administration with system users.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var User = mongoose.model('users');
    var user_required = require('../../config/policies.config').user_required;
    var TweetCommons = require('../../common/tweets');
    var TwitterCommons = require('../../common/twitter');
    var request = require('request');

    // TODO: quit in production
    var util = require('util');


    module.exports = function(app) {

        /**
         * Gets all twitter accounts of current user.
         * Local user authentication required.
         */
        app.get('/twitter', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.find({user: user.email}, function(err, doc){
                    if(err){
                        res.json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get twitter accounts for current user",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter accounts retrieved successfully",
                                "url": process.env.CURRENT_DOMAIN + "/twitter",
                                "content": doc
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Save a twitter account for current user.
         * Local user authentication required.
         */
        app.post('/twitter', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.create(req.body, function(err){
                    if(err){
                        console.log(err);
                        res.json({
                            "error": true,
                            "data" : {
                                "message": "Cannot save twitter account for current user",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter account saved successfully",
                                "url": process.env.CURRENT_DOMAIN + "/twitter",
                                "content": req.body
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Deletes all twitter accounts of current user.
         * Local user authentication required.
         */
        app.delete('/twitter', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.remove({user: user.email}, function(err){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot delete twitter accounts for current user",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter accounts deleted successfully",
                                "url": process.env.CURRENT_DOMAIN + "/twitter"
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Set to not use all twitter accounts of current user (by unique id).
         * Local user authentication required.
         */
        app.get('/twitter/notUse', user_required.before, function(req, res, next) {
            TwitterCommons.notUseAnyAccount(req, function(err){
                if(err){
                    res.json({
                        "error": true,
                        "data" : {
                            "message": "Cannot change the status of any twitter account of user",
                            "url": process.env.CURRENT_DOMAIN + "/twitter"
                        }
                    });
                } else {
                    res.json({
                        "error": false,
                        "data" : {
                            "message": "Now not using any twitter account of user",
                            "url": process.env.CURRENT_DOMAIN + "/twitter"
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Gets one twitter accounts of current user (by unique id).
         * Local user authentication required.
         */
        app.get('/twitter/:id', user_required.before, function(req, res, next) {
            if(req.params.id == "notUse"){
                next();
            } else {
                TwitterCommons.getUserFromJWT(req, function (user) {
                    Twitter.findOne({user: user.email, id_str: req.params.id}, function (err, doc) {
                        if (err) {
                            res.status(500).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot get this twitter account for current user",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data": {
                                    "message": "Twitter account retrieved successfully",
                                    "url": process.env.CURRENT_DOMAIN + "/twitter",
                                    "content": doc
                                }
                            });
                            next();
                        }
                    });
                });
            }
        }, user_required.after);

        /**
         * Set to use one twitter accounts of current user (by unique id).
         * Also set to not use any other possible twitter accounts of current user.
         * Local user authentication required.
         */
        app.get('/twitter/:id/use', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                TwitterCommons.notUseAnyAccount(req, function (err){
                    if (err){
                        res.json({
                            "error": true,
                            "data" : {
                                "message": "Cannot change the status of any twitter account of user",
                                "url": process.env.CURRENT_DOMAIN + "/twitter"
                            }
                        });
                    } else {
                        Twitter.findOneAndUpdate({user: user.email, id_str: req.params.id}, {$set: {in_use: true}},
                            {new: true}, function (err, doc) {
                                if (err) {
                                    res.status(500).json({
                                        "error": true,
                                        "data": {
                                            "message": "Cannot change use status of this twitter account",
                                            "url": process.env.CURRENT_DOMAIN
                                        }
                                    });
                                    next();
                                } else if (doc == null) {
                                    res.status(400).json({
                                        "error": true,
                                        "data": {
                                            "message": "Cannot change use status of this twitter account",
                                            "url": process.env.CURRENT_DOMAIN
                                        }
                                    });
                                    next();
                                } else {
                                    var twitterDoc = doc;
                                    res.json({
                                        "error": false,
                                        "data": {
                                            "message": "Now using twitter account: " + twitterDoc.screen_name,
                                            "url": process.env.CURRENT_DOMAIN + "/twitter",
                                            "content": twitterDoc
                                        }
                                    });
                                    next();
                                }
                            });
                    }
                });
            });
        }, user_required.after);

        /**
         * Update statistics of one twitter account of current user (by unique id).
         * Local user authentication required.
         */
        app.get('/twitter/:id/update', user_required.before, function(req, res, next) {
            if(req.params.id=="update" || req.params.id=="notUse"){
                next();
            } else {
                TwitterCommons.getUserFromJWT(req, function (user) {
                    TwitterCommons.updateStatistics(user, req.params.id, 0, function(){
                        Twitter.findOne({user: user.email, id_str: req.params.id}, function (err, doc) {
                            if (err) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot find this twitter account",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                                next();
                            } else if (doc == null) {
                                res.status(400).json({
                                    "error": true,
                                    "data": {
                                        "message": "This twitter account doesn't exists",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                                next();
                            } else {
                                var twitterDoc = doc;
                                TweetCommons.updateStatistics(doc, req.params.id, 0);
                                res.json({
                                    "error": false,
                                    "data": {
                                        "message": "Updated statistics from twitter account: " +
                                        twitterDoc.screen_name,
                                        "url": process.env.CURRENT_DOMAIN + "/twitter",
                                        "content": twitterDoc
                                    }
                                });
                                next();
                            }
                        });
                    });
                });
            }
        }, user_required.after);

        /**
         * Set to not use one twitter accounts of current user (by unique id).
         * Local user authentication required.
         */
        app.get('/twitter/:id/notUse', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOneAndUpdate({user: user.email, id_str: req.params.id}, {$set: {in_use: false}},
                    {new: true}, function(err, doc){
                        if(err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else if(doc==null){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "Now not using twitter account: " + doc.screen_name,
                                    "url": process.env.CURRENT_DOMAIN + "/twitter",
                                    "content": doc
                                }
                            });
                            next();
                        }
                    });
            });
        }, user_required.after);

        /**
         * Deletes one twitter account of current user (by unique id).
         * Local user authentication required.
         */
        app.delete('/twitter/:id', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOneAndRemove({user: user.email, id_str: req.params.id}, function(err, doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot delete twitter accounts for current user",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter account deleted successfully",
                                "url": process.env.CURRENT_DOMAIN + "/twitter",
                                "content": doc
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Gets stats by day of one twitter account of current user by unique twitter account id.
         * Including stats are tweets/day, retweets/day, favorites/day.
         */
        app.get('/twitter/:id/statsDay', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOne({user: user.email, id_str: req.params.id}, function(err, account){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "message": "Cannot retrieve Twitter day stats",
                                "url": process.env.CURRENT_DOMAIN + "/"
                            }
                        });
                        next();
                    } else {
                        TweetCommons.getOwnTweets(account, function (own) {
                            if (own.statusCode && own.statusCode != 200) {
                                res.status(own.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot retrieve Twitter day stats",
                                        "url": process.env.CURRENT_DOMAIN + "/"
                                    }
                                });
                                next();
                            } else {
                                var object = {};
                                var retweets = {};
                                var favorites = {};
                                var average = 0;
                                var averageRetweets = 0;
                                var averageFavorites = 0;
                                for(var value in own){
                                    if(own[value].user.id_str == req.params.id && own[value].retweeted == false) {
                                        var date = new Date(own[value].created_at);
                                        var day = date.getDate() + "/" + date.getMonth();
                                        object[day] = (object[day] | 0) + 1;
                                        retweets[day] = (retweets[day] | 0) + own[value].retweet_count;
                                        favorites[day] = (favorites[day] | 0) + own[value].favorite_count;
                                    }
                                }
                                var days = 0;
                                for (var attribute in object) {
                                    days = days + 1;
                                    average = average + object[attribute];
                                }
                                average = average / days;
                                days = 0;
                                for (var attribute2 in retweets) {
                                    days = days + 1;
                                    averageRetweets = averageRetweets + retweets[attribute2];
                                }
                                averageRetweets = averageRetweets / days;
                                days = 0;
                                for (var attribute3 in favorites) {
                                    days = days + 1;
                                    averageFavorites = averageFavorites + favorites[attribute3];
                                }
                                averageFavorites = averageFavorites / days;
                                res.json({
                                    "error": false,
                                    "data": {
                                        "message": "Twitter day stats retrieved succesfully",
                                        "url": process.env.CURRENT_DOMAIN + "/twitter",
                                        "content": {
                                            screen_name: account.screen_name, avgTweetsDay: average,
                                            avgRetweetsDay: averageRetweets, avgFavoritesDay: averageFavorites
                                        }
                                    }
                                });
                                next();
                            }
                        });
                    }
                });
            });
        }, user_required.after);

        /**
         * Gets stats by date of one twitter account of current user by unique twitter account id.
         * Including stats are based in mentions.
         */
        app.get('/twitter/:id/statsMentions', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOne({user: user.email, id_str: req.params.id}, function(err, account){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "message": "Cannot retrieve Twitter mention stats",
                                "url": process.env.CURRENT_DOMAIN + "/"
                            }
                        });
                        next();
                    } else {
                        TweetCommons.getOwnTweets(account, function (own) {
                            if (own.statusCode && own.statusCode != 200) {
                                res.status(own.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot retrieve Twitter mention stats",
                                        "url": process.env.CURRENT_DOMAIN + "/"
                                    }
                                });
                                next();
                            } else {
                                var object = {};
                                own.forEach(function (value) {
                                    var date = new Date(value.created_at);
                                    var day = date.getDate() + "/" + date.getMonth();
                                    if (!object[day]) {
                                        object[day] = 0;
                                    } else {
                                        object[day] = 0;
                                    }
                                });
                                TweetCommons.searchMentions(account, function (mentions) {
                                    if (mentions.statusCode && mentions.statusCode != 200) {
                                        res.status(mentions.statusCode).json({
                                            "error": true,
                                            "data": {
                                                "message": "Cannot retrieve Twitter mention stats",
                                                "url": process.env.CURRENT_DOMAIN + "/"
                                            }
                                        });
                                        next();
                                    } else {
                                        mentions.forEach(function (value) {
                                            var date = new Date(value.created_at);
                                            var day = date.getDate() + "/" + date.getMonth();
                                            if (!object[day]) {
                                                object[day] = 1;
                                            } else {
                                                object[day] = object[day] + 1;
                                            }
                                        });
                                        res.json({
                                            "error": false,
                                            "data": {
                                                "message": "Twitter mention stats retrieved succesfully",
                                                "url": process.env.CURRENT_DOMAIN + "/twitter",
                                                "content": object
                                            }
                                        });
                                        next();
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }, user_required.after);

        /**
         * Gets stats by date of one twitter account of current user by unique twitter account id.
         * Including stats are based in mentions.
         */
        app.get('/twitter/:id/followers', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function (user) {
                Twitter.findOne({user: user.email, id_str: req.params.id}, function (err, account) {
                    if (err) {
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "message": "Cannot retrieve Twitter followers",
                                "url": process.env.CURRENT_DOMAIN + "/"
                            }
                        });
                        next();
                    } else {
                        TweetCommons.getFollowersList(account, function (results) {
                            if (results.statusCode && results.statusCode != 200) {
                                res.status(results.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot retrieve Twitter followers",
                                        "url": process.env.CURRENT_DOMAIN + "/"
                                    }
                                });
                                next();
                            } else {
                                res.json({
                                    "error": false,
                                    "data": {
                                        "message": "Twitter followers retrieved succesfully",
                                        "url": process.env.CURRENT_DOMAIN + "/twitter",
                                        "content": results.users
                                    }
                                });
                                next();
                            }
                        });
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