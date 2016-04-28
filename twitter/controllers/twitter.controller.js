/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var OAuth = require('oauth').OAuth;
    var Twitter = mongoose.model('twitter');
    var User = mongoose.model('users');
    var atob = require('atob');
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
         * @param id is the id of the twitter user.
         * @param callback is the callback object, containing the resultant user data (statistics info).
         */
        function getUserInfo(user, id, callback){
            initTwitterOauth(function(oa)
            {
                oa.get(
                    "https://api.twitter.com/1.1/users/show.json?id=" + id
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
         * Increments the local saved number of tweets by num.
         * @param user is the local user object.
         * @param id is the twitter id user.
         * @param num_app is the number to add to the local total tweets statistic.
         */
        function updateStatistics(user, id, num_app, callback){
            getUserInfo(user, id, function(result){
                Twitter.findOneAndUpdate({id_str: id},
                    {$set:
                    {
                        statuses_count: result.statuses_count,
                        followers_count: result.followers_count,
                        friends_count: result.friends_count,
                        favourites_count: result.favourites_count,
                        profile_image_url: result.profile_image_url,
                        screen_name: result.screen_name,
                        description: result.description,
                        name: result.name,
                        location: result.location,
                        url: result.url
                    },
                        $inc: { tweet_app: num_app }}, {new: true}, function(err, doc){
                        if(err) {
                            console.log(err);
                            callback();
                        }
                        callback();
                    });
            });
        }

        /**
         * Gets all twitter accounts of current user.
         * Local user authentication required.
         */
        app.get('/twitter', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                Twitter.find({user: user.email}, function(err, doc){
                    if(err){
                        res.json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get twitter accounts for current user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter accounts retrieved successfully",
                                "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.create(req.body, function(err){
                    if(err){
                        console.log(err);
                        res.json({
                            "error": true,
                            "data" : {
                                "message": "Cannot save twitter account for current user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter account saved successfully",
                                "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.remove({user: user.email}, function(err){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot delete twitter accounts for current user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter accounts deleted successfully",
                                "url": "http://localhost:3000/twitter"
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
            getUserFromJWT(req, function(user){
                Twitter.update({user: user.email}, {$set: {in_use: false}}, {multi: true}, function(err){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot change use status of twitter accounts",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Now not using any twitter account of user",
                                "url": "http://localhost:3000/twitter"
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
                getUserFromJWT(req, function (user) {
                    Twitter.findOne({user: user.email, id_str: req.params.id}, function (err, doc) {
                        if (err) {
                            res.status(500).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot get this twitter account for current user",
                                    "url": "http://localhost:3000/"
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data": {
                                    "message": "Twitter account retrieved successfully",
                                    "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.findOneAndUpdate({user: user.email, id_str: req.params.id}, {$set: {in_use: true}},
                    {new: true}, function(err, doc){
                        if(err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": "http://localhost:3000/"
                                }
                            });
                            next();
                        } else if(doc==null){
                            res.status(400).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": "http://localhost:3000/"
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
                                            "url": "http://localhost:3000/"
                                        }
                                    });
                                    next();
                                } else if(doc==null) {
                                    res.status(400).json({
                                        "error": true,
                                        "data" : {
                                            "message": "Cannot update statistics of this twitter account on change " +
                                            "(User doesn't exists)",
                                            "url": "http://localhost:3000/"
                                        }
                                    });
                                    next();
                                } else {
                                    res.json({
                                        "error": false,
                                        "data" : {
                                            "message": "Now using twitter account: " + twitterDoc.screen_name,
                                            "url": "http://localhost:3000/twitter",
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
                getUserFromJWT(req, function (user) {
                    updateStatistics(user, req.params.id, 1, function(){
                        Twitter.findOne({user: user.email, id_str: req.params.id}, function (err, doc) {
                            if (err) {
                                res.status(500).json({
                                    "error": true,
                                    "data": {
                                        "message": "Cannot find this twitter account",
                                        "url": "http://localhost:3000/"
                                    }
                                });
                                next();
                            } else if (doc == null) {
                                res.status(400).json({
                                    "error": true,
                                    "data": {
                                        "message": "This twitter account doesn't exists",
                                        "url": "http://localhost:3000/"
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
                                                "url": "http://localhost:3000/"
                                            }
                                        });
                                        next();
                                    } else if (doc == null) {
                                        res.status(400).json({
                                            "error": true,
                                            "data": {
                                                "message": "Cannot update statistics of this twitter account " +
                                                "(User doesn't exists)",
                                                "url": "http://localhost:3000/"
                                            }
                                        });
                                        next();
                                    } else {
                                        res.json({
                                            "error": false,
                                            "data": {
                                                "message": "Updated statistics from twitter account: " +
                                                twitterDoc.screen_name,
                                                "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.findOne({user: user.email, in_use: true}, function(err, doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot find this twitter account",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else if(doc==null){
                        res.status(400).json({
                            "error": true,
                            "data" : {
                                "message": "This twitter account doesn't exists",
                                "url": "http://localhost:3000/"
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
                                        "url": "http://localhost:3000/"
                                    }
                                });
                                next();
                            } else if(doc==null) {
                                res.status(400).json({
                                    "error": true,
                                    "data" : {
                                        "message": "Cannot update statistics of this twitter account " +
                                        "(User doesn't exists)",
                                        "url": "http://localhost:3000/"
                                    }
                                });
                                next();
                            } else {
                                res.json({
                                    "error": false,
                                    "data" : {
                                        "message": "Updated statistics from twitter account: " +
                                        twitterDoc.screen_name,
                                        "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.findOneAndUpdate({user: user.email, id_str: req.params.id}, {$set: {in_use: false}},
                    {new: true}, function(err, doc){
                        if(err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": "http://localhost:3000/"
                                }
                            });
                            next();
                        } else if(doc==null){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot change use status of this twitter account",
                                    "url": "http://localhost:3000/"
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "Now not using twitter account: " + doc.screen_name,
                                    "url": "http://localhost:3000/twitter",
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
            getUserFromJWT(req, function(user){
                Twitter.findOneAndRemove({user: user.email, id_str: req.params.id}, function(err, doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot delete twitter accounts for current user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter account deleted successfully",
                                "url": "http://localhost:3000/twitter",
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