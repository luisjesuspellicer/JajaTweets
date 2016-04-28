/**
 * Created by piraces on 22/4/16.
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
         *
         * (Checked)
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
         *
         * (Checked)
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
         *
         * (Checked)
         */
        app.get('/twitter/notUse', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.update({user: user.email}, {$set: {in_use: false}}, {multi: true}, function(err){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot change use status of twitter accounts",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Now not using any twitter account of user",
                                "url": process.env.CURRENT_DOMAIN + "/twitter"
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Gets one twitter accounts of current user (by unique id).
         * Local user authentication required.
         *
         * (Checked)
         */
        app.get('/twitter/:id', user_required.before, function(req, res, next) {
            if(req.params.id == "notUse" || req.params.id == "update"){
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
         * Local user authentication required.
         *
         * (Checked)
         */
        app.get('/twitter/:id/use', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOneAndUpdate({user: user.email, id_str: req.params.id}, {$set: {in_use: true}},
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
                            res.status(400).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            var twitterDoc = doc;
                            User.findOneAndUpdate({email: user.email}, {$set: {tweet_app: twitterDoc.tweet_app,
                                tweet_total: doc.statuses_count}}, function(err, doc){
                                if(err){
                                    res.status(500).json({
                                        "error": true,
                                        "data" : {
                                            "message": "Cannot update statistics of this twitter account on change",
                                            "url": process.env.CURRENT_DOMAIN
                                        }
                                    });
                                    next();
                                } else if(doc==null) {
                                    res.status(400).json({
                                        "error": true,
                                        "data" : {
                                            "message": "Cannot update statistics of this twitter account on change " +
                                            "(User doesn't exists)",
                                            "url": process.env.CURRENT_DOMAIN
                                        }
                                    });
                                    next();
                                } else {
                                    res.json({
                                        "error": false,
                                        "data" : {
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
         *
         * (Checked)
         */
        app.get('/twitter/:id/update', user_required.before, function(req, res, next) {
            if(req.params.id=="update" || req.params.id=="notUse"){
                next();
            } else {
                TwitterCommons.getUserFromJWT(req, function (user) {
                    TwitterCommons.updateStatistics(user, req.params.id, 1, function(){
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
                                User.findOneAndUpdate({email: user.email}, {
                                    $set: {
                                        tweet_app: doc.tweet_app,
                                        tweet_total: doc.statuses_count
                                    }
                                }, function (err, doc) {
                                    if (err) {
                                        res.status(500).json({
                                            "error": true,
                                            "data": {
                                                "message": "Cannot update statistics of this twitter account",
                                                "url": process.env.CURRENT_DOMAIN
                                            }
                                        });
                                        next();
                                    } else if (doc == null) {
                                        res.status(400).json({
                                            "error": true,
                                            "data": {
                                                "message": "Cannot update statistics of this twitter account " +
                                                "(User doesn't exists)",
                                                "url": process.env.CURRENT_DOMAIN
                                            }
                                        });
                                        next();
                                    } else {
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
                            }
                        });
                    });
                });
            }
        }, user_required.after);

        /**
         * Update statistics of in use twitter account of current user (by unique id).
         * Local user authentication required.
         *
         * (Checked)
         */
        app.get('/twitter/update', user_required.before, function(req, res, next) {
            TwitterCommons.getUserFromJWT(req, function(user){
                Twitter.findOne({user: user.email, in_use: true}, function(err, doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot find this twitter account",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else if(doc==null){
                        res.status(400).json({
                            "error": true,
                            "data" : {
                                "message": "This twitter account doesn't exists",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        var twitterDoc = doc;
                        User.findOneAndUpdate({email: user.email}, {$set: {tweet_app: doc.tweet_app,
                            tweet_total: doc.statuses_count}}, function(err, doc){
                            if(err){
                                res.status(500).json({
                                    "error": true,
                                    "data" : {
                                        "message": "Cannot update statistics of this twitter account",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                                next();
                            } else if(doc==null) {
                                res.status(400).json({
                                    "error": true,
                                    "data" : {
                                        "message": "Cannot update statistics of this twitter account " +
                                        "(User doesn't exists)",
                                        "url": process.env.CURRENT_DOMAIN
                                    }
                                });
                                next();
                            } else {
                                res.json({
                                    "error": false,
                                    "data" : {
                                        "message": "Updated statistics from twitter account: " +
                                        twitterDoc.screen_name,
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
         * Set to not use one twitter accounts of current user (by unique id).
         * Local user authentication required.
         *
         * (Checked)
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
         *
         * (Checked)
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


        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();