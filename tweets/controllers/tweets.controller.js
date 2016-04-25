/**
 * Created by piraces on 22/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var OAuth = require('oauth').OAuth;
    var atob = require('atob');
    var Tweet = mongoose.model('tweets');
    var User = mongoose.model('users');
    var user_required = require('../../config/policies.config').user_required;

    // TODO: Quit in production
    var util = require('util');


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
         * Function for posting a new tweet using OAuth, user token and secret.
         * It needs an initial OAuth object with the twitter application consumer key and secret.
         * @param user is the local user object (from database).
         * @param body is the body of the request made.
         * @param callback is the callback object, containing response of Twitter.
         */
        function makeTweet(user, body, callback) {
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/statuses/update.json"
                    , user.token
                    , user.secret
                    // Tweet content
                    , {
                        "status": body.status
                        //"in_reply_to_status_id": body.in_reply_to_status_id,
                        //"lat": body.lat,
                        //"long": body.long,
                        //"place_id": body.place_id
                    }
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
         * Gets an unique tweet from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param params are the params of the request.
         * @param callback is the callback object, containing the resultant tweet data.
         */
        function getTweet(user, params, callback){
            initTwitterOauth(function(oa)
            {
                oa.get(
                    "https://api.twitter.com/1.1/statuses/show.json?" +
                    "id=" + params.id
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
         * Retweet an unique tweet from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param params are the params of the request.
         * @param callback is the callback object, containing the resultant tweet data (and retweet data).
         */
        function makeRetweet(user, params, callback){
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/statuses/retweet/" + params.id + ".json"
                    , user.token
                    , user.secret
                    // Content
                    , {
                        "id": params.id
                    }
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
         * Unretweets an unique tweet from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param params are the params of the request.
         * @param callback is the callback object, containing the resultant tweet data (and unretweet data).
         */
        function makeUnretweet(user, params, callback){
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/statuses/unretweet/" + params.id + ".json"
                    , user.token
                    , user.secret
                    // Content
                    , {
                        "id": params.id
                    }
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
         * Favorite/like an unique tweet from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param params are the params of the request.
         * @param callback is the callback object, containing the resultant tweet data (and favorite data).
         */
        function makeFavorite(user, params, callback){
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/favorites/create.json"
                    , user.token
                    , user.secret
                    // Content
                    , {
                        "id": params.id
                    }
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
         * Unfavorite/dislike an unique tweet from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param params are the params of the request.
         * @param callback is the callback object, containing the resultant tweet data (and unfavorite data).
         */
        function makeUnfavorite(user, params, callback){
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/favorites/destroy.json"
                    , user.token
                    , user.secret
                    // Content
                    , {
                        "id": params.id
                    }
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
        function updateStatistics(user, id, num_app){
            getUserInfo(user, id, function(result){
                User.findOneAndUpdate({email: user.email}, {$set: {tweet_total: result.statuses_count},
                    $inc: { tweet_app: num_app }}, function(err, doc){
                        if(err) {
                            console.log(err);
                        }
                    });
            });
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
         * Gets own tweets from Twitter.
         * Requires user authentication.
         * @param callback is the object callback, a user from database.
         */
        function getOwnTweets(user, callback){
            initTwitterOauth(function(oa)
            {
                oa.get(
                    "https://api.twitter.com/1.1/statuses/user_timeline.json?count=200"
                    , user.token,user.secret,
                    function(error, data, response){
                        if(error){
                            callback(error);
                        }else{
                            callback(JSON.parse(data));
                        }
                    }

                )});

        }
        /**
         * Gets all tweets from Twitter account.
         * Requires user authentication
         * @param user is the local user object.
         * @param callback is the object callback, a user from database.
         */
        function getAccountTweets(user,callback){
            initTwitterOauth(function(oa)
            {
                oa.get(
                    "https://api.twitter.com/1.1/statuses/home_timeline.json?count=200"
                    , user.token,user.secret,
                    function(error, data, response){
                        if(error){
                            callback(error);
                        }else{
                            callback(JSON.parse(data));
                        }
                    }

                )});
        }
        /**
         * Delete tweet in Twitter
         * Requires user authentication.
         * @param user is the local user object.
         * @param callback is the object callback, a user from database.
         */
        function deleteTweet(user, id, callback){
            initTwitterOauth(function(oa)
            {
                oa.post(
                    "https://api.twitter.com/1.1/statuses/destroy/"+id+".json"
                    , user.token,user.secret,
                    function(error, data, response){

                        if(error){
                            callback(error);
                        }else{
                            callback(JSON.parse(data));
                        }
                    }

                )});
        }
        /**
         * Endpoint that updates a twitter status (post a tweet).
         * Requires a local user account with at least one twitter account associated.
         * Body parameters required:
         * - date: javascript date object (timestamp or string).
         * - status: status to put on the tweet.
         */
        app.post('/tweets', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user) {
                var date = new Date();
                if(req.body.date && new Date(req.body.date) > date) {
                    // If tweet date is posterior of current date, the tweet is saved for posterior posting

                    var newTweet = new Tweet({
                        "status": req.body.status,
                        "date": req.body.date,
                        "user": user._id
                    });
                    newTweet.save(function(err){
                        if(err){
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Could not save tweet in database",
                                    "url": "http://localhost:3000/"
                                }
                            });
                        } else {
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "Tweet saved succesfully",
                                    "url": "http://localhost:3000/tweets"
                                }
                            });
                        }
                        next();
                    });
                } else {
                    // If tweet date is before or equal to current date, its updated directly
                    makeTweet(user, req.body, function(result){
                        if(result.id_str){
                            updateStatistics(user, result.user.id_str, 1);
                            res.json({
                                "error": false,
                                "data" : {
                                    "message": "Tweet post successful",
                                    "id_str": result.id_str,
                                    "url": "http://twitter.com/" + "statuses/" + result.id_str
                                }
                            });
                        } else if(result.statusCode && result.statusCode != 200){
                            res.status(result.statusCode).json({
                                "error": true,
                                "data" : {
                                    "message": "Tweet post unsuccessful",
                                    "url": "http://localhost:3000/"
                                }
                            });
                        } else {
                            res.status(500).json({
                                "error": true,
                                "data" : {
                                    "message": "Cannot post the specified tweet",
                                    "url": "http://localhost:3000/"
                                }
                            });
                        }
                        next();
                    });
                }});
        }, user_required.after);

        /**
         * Gets own tweets.
         * Requires a local user account with at least one twitter account associated.
         */
        app.get('/tweets::own', user_required.before, function(req, res, next) {

            getUserFromJWT(req, function(user){
                getOwnTweets(user,function(result){
                    if(result.statusCode && result.statusCode != 200){
                        consolelog("También entra");
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get own tweets",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {

                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Own tweets",
                                "url": "http://localhost:3000/",
                                "content": result
                            }
                        });

                        next();
                    }
                });
            });
        }, user_required.after);
        /**
         * Gets a tweet by the unique tweet id, and provides the data of it.
         * Requires a local user account with at least one twitter account associated.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                getTweet(user, req.params, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get tweet with id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {

                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Tweet get successful",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);


        /**
         * Makes a retweet on a specific tweet (with determinated user account).
         * Requires a local user account with at least one twitter account associated.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id/retweet', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                makeRetweet(user, req.params, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot retweet with id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Retweet successful",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Makes an unretweet on a specific tweet (with determinated user account).
         * Requires a local user account with at least one twitter account associated.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id/unretweet', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                makeUnretweet(user, req.params, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot unretweet with id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else if(result.retweeted==false) {
                        res.status(400).json({
                            "error": true,
                            "data" : {
                                "message": "Tweet wasn't retweeted",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Unretweet successful",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Makes a favorite/like on a specific tweet (with determinated user account).
         * Requires a local user account with at least one twitter account associated.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id/favorite', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                makeFavorite(user, req.params, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot mark as favorite tweet with id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Favorite/Like successful",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Makes a favorite/like on a specific tweet (with determinated user account).
         * Requires a local user account with at least one twitter account associated.
         * Get parameters required:
         * - id: unique tweet id (from Twitter "id_str").
         */
        app.get('/tweets/:id/unfavorite', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                makeUnfavorite(user, req.params, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot unfavorite with id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Unfavorite successful",
                                "url": "http://twitter.com/" + "statuses/" + result.id_str,
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);




        /*
         * Modify only pending tweets.
         * Body parameters required:
         * - date: javascript date object (timestamp or string).
         * - status: status to put on the tweet.
         * - id  unique tweet id (from Twitter "id_str").
         */
        app.put('/tweets/:id', user_required.before, function(req, res, next) {
            var date = new Date();
            Tweet.update({"id":req.params.id},{"date":body.date,"status":body.status},function(err, result){
                if(err){
                    res.json({
                        "error": true,
                        "data" : {
                            "message": "Cant't modify tweet",
                            "url": "localhost:3000/tweets" + req.params.id,
                            "content": result
                        }
                    });
                    next();
                }else{
                    res.json({
                        "error": false,
                        "data" : {
                            "message": "Tweet successfully changed",
                            "url": "localhost:3000/tweets" + req.params.id,
                            "content": result
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        
        app.delete('/tweets/:id', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                deleteTweet(user, req.params.id, function(result){
                    console.log(req.params.id);
                    if(result.statusCode && result.statusCode != 200){
                        console.log(result);
                        res.status(result.statusCode).json({

                            "error": true,
                            "data" : {
                                "message": "Cannot delete tweet with  id: " + req.params.id,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        console.log(result);
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Delete successful",
                                "url": "localhost:3000/tweets::own",
                                "content": result
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);
        
        app.get('/tweets', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                getAccountTweets(user,function(result){
                    if(result.statusCode && result.statusCode != 200){
                        consolelog("También entra");
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get own tweets",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {

                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Search successful",
                                "url": "http://localhost:3000/",
                                "content": result
                            }
                        });

                        next();
                    }
                });
            });
        }, user_required.after);
        
        app.get('/tweets::pending', user_required.before, function(req, res, next) {
            Tweet.find({}, function (err, tweets) {
                if(err){
                    res.json({"error": true,
                        "data": {
                            "message": "Cannot found pending tweets",
                            "url": "localhost:3000/"

                         }
                    });

                }else{
                    console.log(tweets);
                    res.json({
                        "error": false,
                        "data" : {
                            "message": "Successful search",
                            "url": "localhost:3000/",
                            "content": tweets
                        }
                    });
                }
            });
        }, user_required.after);
        
        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();