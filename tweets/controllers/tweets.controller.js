/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: tweets.controller.js
 * Description: Contains functions to perform actions with "tweets" resource.
 * It performs actions with tweets from Twitter and local tweets.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var Tweet = mongoose.model('tweets');
    var Twitter = mongoose.model('twitter');
    var user_required = require('../../config/policies.config').user_required;
    var TweetCommons = require('../../common/tweets');


    module.exports = function(app) {
        

        /**
         * Get all tweets from Twitter account (timeline tweets).
         * Body parameters required:
         * - id  unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.getAccountTweets(user,function(result){
                        if(result.statusCode && result.statusCode != 200){
                            // Twitter API interaction error
                            res.status(result.statusCode).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot get own tweets",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else {
                            res.status(200).json({
                                "error": false,
                                "data" : {
                                    "message": "Search successful",
                                    "url": process.env.CURRENT_DOMAIN,
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Endpoint that updates a twitter status (post a tweet), or keeps it to update later (pending tweet).
         * Requires a local user account with at least one twitter account associated and in user.
         * Body parameters required:
         * - date: javascript date object (timestamp or string).
         * - status: status to put on the tweet.
         */
        app.post('/tweets', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user) {
                if(user==null) {
                    next();
                } else {
                    var date = new Date();
                    if(req.body.date && new Date(req.body.date) > date) {
                        Twitter.findOne({user: user.user, in_use: true}, function(err, doc){
                            if (err || doc==null){
                                res.status(500).json({
                                    "error": true,
                                    "data" : {
                                        "message": "Could not obtain user info from database",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            } else {
                                // If tweet date is posterior of current date, the tweet is saved for posterior posting
                                var newTweet = new Tweet({
                                    "status": req.body.status,
                                    "date": req.body.date,
                                    "user": user.user,
                                    "token": user.token,
                                    "secret": user.secret,
                                    "id_str": user.id_str,
                                    "profile_image_url": user.profile_image_url,
                                    "screen_name": user.screen_name

                                });
                                newTweet.save(function (err, doc) {
                                    if (err) {
                                        res.status(500).json({
                                            "error": true,
                                            "data": {
                                                "message": "Could not save tweet in database",
                                                "url": process.env.CURRENT_DOMAIN
                                            }
                                        });
                                    } else {
                                        res.status(200).json({
                                            "error": false,
                                            "data": {
                                                "message": "Tweet saved succesfully",
                                                "url": process.env.CURRENT_DOMAIN + "/tweets",
                                                "content": doc
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        // If tweet date is before or equal to current date, its updated directly
                        TweetCommons.makeTweet(user, req.body, function (result) {
                            if (result.id_str) {
                                // Update twitter statistics locally
                                TweetCommons.updateStatistics(user, result.user.id_str, 1);
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Tweet post successful",
                                        "id_str": result.id_str,
                                        "url": "http://twitter.com/" + "statuses/" + result.id_str
                                    }
                                });
                            } else if (result.statusCode && result.statusCode != 200) {
                                // Twitter API interaction error
                                res.status(result.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Tweet post unsuccessful",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            } else {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot post the specified tweet",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            }
                        });
                    }
                }});
        }, user_required.after);

        /**
         * Gets a tweet by the unique tweet id, and provides the data of it.
         * Requires a local user account with at least one twitter account associated and in use.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id', user_required.before, function(req, res, next) {
            if(req.params.id == "own" || req.params.id == "pending"){
                next();
            } else {
                TweetCommons.getUserFromJWT(req, function (user) {
                    if (user == null) {
                        next();
                    } else {
                        TweetCommons.getTweet(user, req.params, function (result) {
                            if (result.statusCode && result.statusCode != 200) {
                                // Twitter API interaction error
                                res.status(result.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot get tweet with id: " + req.params.id,
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            } else {
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Tweet get successful",
                                        "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                        "content": result
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }, user_required.after);

        /**
         * Modifies one pending tweet.
         * Body parameters required:
         * - date: javascript date object (timestamp or string).
         * - status: status to put on the tweet.
         * - id  unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user) {
                    Tweet.findOneAndUpdate({"_id": req.params.id, user: user.user},
                        {"date": req.body.date, "status": req.body.status}, {new: true}, function (err, result) {
                            if (err) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot modify tweet",
                                        "url": process.env.CURRENT_DOMAIN + "/tweets" + req.params.id
                                    }
                                });
                            } else if (result == null) {
                                res.status(404).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot modify tweet (doesn't exists)",
                                        "url": process.env.CURRENT_DOMAIN + "/tweets" + req.params.id
                                    }
                                });
                            } else {
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Tweet successfully changed",
                                        "url": process.env.CURRENT_DOMAIN + "/tweets/" + req.params.id,
                                        "content": result
                                    }
                                });
                            }
                        });
                } else {
                    res.status(500).json({
                        "error": true,
                        "data": {
                            "message": "Cannot modify tweet",
                            "url": process.env.CURRENT_DOMAIN + "/tweets" + req.params.id
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Delete tweet from Twitter.
         * Body parameters required:
         * - id  unique tweet id (from Twitter "id_str").
         */
        app.delete('/tweets/:id', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.deleteTweet(user, req.params.id, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            // Twitter API interaction error
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot delete tweet with  id: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else {

                            res.status(200).json({
                                "error": false,
                                "data": {
                                    "message": "Delete successful",
                                    "url": process.env.CURRENT_DOMAIN + "/tweets/own",
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Gets own tweets (tweets written with in use account).
         * Requires a local user account with at least one twitter account associated in use.
         */
        app.get('/tweets/:own', user_required.before, function(req, res, next) {
            if(req.params.own != "own"){
                next();
            } else {
                TweetCommons.getUserFromJWT(req, function (user) {
                    if (user == null) {
                        next();
                    } else {
                        TweetCommons.getOwnTweets(user, function (result) {
                            // Twitter API interaction error
                            if (result.statusCode && result.statusCode != 200) {
                                res.status(result.statusCode).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot get own tweets",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            } else {
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Own tweets",
                                        "url": process.env.CURRENT_DOMAIN,
                                        "content": result
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }, user_required.after);


        /**
         * Makes a retweet on a specific tweet (with an user account in use).
         * Requires a local user account with at least one twitter account associated and in use.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id/retweet', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.makeRetweet(user, req.params, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            // Twitter API interaction error
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot retweet with id: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else {
                            res.status(200).json({
                                "error": false,
                                "data": {
                                    "message": "Retweet successful",
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Makes an unretweet on a specific tweet (with an user account).
         * Requires a local user account with at least one twitter account associated and in use.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id/unretweet', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.makeUnretweet(user, req.params, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            // Twitter API interaction error
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot unretweet with id: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else if (result.retweeted == false) {
                            res.status(400).json({
                                "error": true,
                                "data": {
                                    "message": "Tweet wasn't retweeted",
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str
                                }
                            });
                        } else {
                            res.status(200).json({
                                "error": false,
                                "data": {
                                    "message": "Unretweet successful",
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Makes a favorite/like on a specific tweet (with an user account).
         * Requires a local user account with at least one twitter account associated and in use.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id/favorite', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.makeFavorite(user, req.params, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            // Twitter API interaction error
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot mark as favorite tweet with id: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else {
                            res.status(200).json({
                                "error": false,
                                "data": {
                                    "message": "Favorite/Like successful",
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Undo a favorite/like on a specific tweet (with an user account).
         * Requires a local user account with at least one twitter account associated and in use.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id/unfavorite', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user==null){
                    next();
                } else {
                    TweetCommons.makeUnfavorite(user, req.params, function (result) {
                        if (result.statusCode && result.statusCode != 200) {
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot unfavorite with id: " + req.params.id,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                        } else {
                            res.status(200).json({
                                "error": false,
                                "data": {
                                    "message": "Unfavorite successful",
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                    "content": result
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Get pending tweets from user (waiting for posting). User authentication required.
         * Requires a local user account with at least one twitter account associated.
         */
        app.get('/tweets/:pending', user_required.before, function(req, res, next) {
            if(req.params.pending != "pending"){
                next();
            } else {
                TweetCommons.getUserFromJWT(req, function(user) {
                    if (user) {
                        Tweet.find({user: user.user}, function (err, tweets) {
                            if (err || tweets==null) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot found pending tweets",
                                        "url": process.env.CURRENT_DOMAIN

                                    }
                                });
                            } else {
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Successful search",
                                        "url": process.env.CURRENT_DOMAIN,
                                        "content": tweets
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "message": "Cannot found pending tweets",
                                "url": process.env.CURRENT_DOMAIN

                            }
                        })
                    }

                });
            }
        }, user_required.after);

        /**
         * Delete pending tweet from user, by unique tweet (local) id. User authentication required.
         * Requires a local user account with at least one twitter account associated.
         */
        app.delete('/tweets/pending/:id', user_required.before, function(req, res, next) {
            if(req.params.id == "pending" || req.params.id == "own"){
                next();
            } else {
                TweetCommons.getUserFromJWT(req, function(user){
                    if(user) {
                        Tweet.findOneAndRemove({_id: req.params.id, user: user.user}, function (err, tweet) {
                            if (err) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot delete pending tweet",
                                        "url": process.env.CURRENT_DOMAIN

                                    }
                                });
                            } else if (tweet == null) {
                                res.status(404).json({
                                    "error": true,
                                    "data": {
                                        "message": "This pending tweet doesn't exists",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                            } else {
                                res.status(200).json({
                                    "error": false,
                                    "data": {
                                        "message": "Successful delete",
                                        "url": process.env.CURRENT_DOMAIN,
                                        "content": tweet
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(500).json({
                            "error": true,
                            "data": {
                                "message": "Cannot delete pending tweet",
                                "url": process.env.CURRENT_DOMAIN

                            }
                        });
                    }
                });
            }
        }, user_required.after);

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();