/**
 * Created by piraces on 28/4/16.
 */

(function () {

    var OAuth = require('./OAuth');
    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var User = mongoose.model('users');
    var passport = require('passport');
    var request = require('request');
    var atob = require('atob');

    /**
     * Function for posting a new tweet using OAuth, user token and secret.
     * It needs an initial OAuth object with the twitter application consumer key and secret.
     * @param user is the local user object (from database).
     * @param body is the body of the request made.
     * @param callback is the callback object, containing response of Twitter.
     */
    function makeTweet(user, body, callback) {
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
            Twitter.findOneAndUpdate({user: user.user}, {$set: {statuses_count: result.statuses_count},
                $inc: { tweet_app: num_app }}, function(err, doc){
                if(err) {
                    console.log(err);
                }
                Twitter.find({user:user.user}, function(err,docs){
                    if(err){
                        console.log(err);
                    }
                    var totalTwitter = 0;
                    var totalApp = 0;
                    for(var doc in docs){
                        totalTwitter = totalTwitter + docs[doc].statuses_count;
                        totalApp = totalApp + docs[doc].tweet_app;
                    }
                    User.findOneAndUpdate({email: user.user}, {$set: {tweet_total: totalTwitter, tweet_app: totalApp}},
                        function(err, doc){
                        if(err) {
                            console.log(err);
                        }
                    });
                });
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
        Twitter.findOne({user: payload.email, in_use: true}, function(err, doc){
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
     * @param user is the twitter user.
     * @param callback is the object callback, a user from database.
     */
    function getOwnTweets(user, callback){
        OAuth.initTwitterOauth(function(oa)
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
        OAuth.initTwitterOauth(function(oa)
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
     * @param id is the unique tweet id.
     * @param callback is the object callback, a user from database.
     */
    function deleteTweet(user, id, callback) {
        OAuth.initTwitterOauth(function (oa) {
            oa.post(
                "https://api.twitter.com/1.1/statuses/destroy/" + id + ".json"
                , user.token
                , user.secret
                // Content
                , {
                    "id": id
                },
                function (error, data, response) {

                    if (error) {
                        callback(error);
                    } else {
                        callback(JSON.parse(data));
                    }
                }
            )
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
        OAuth.initTwitterOauth(function(oa)
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
     * Search mentions of specific user from Twitter by unique id.
     * Requires user authentication.
     * @param user is the local user.
     * @param callback is the callback object, containing the resultant mentions data (searched mention tweets).
     */
    function searchMentions(user, callback){
        OAuth.initTwitterOauth(function(oa)
        {
            oa.get(
                "https://api.twitter.com/1.1/statuses/mentions_timeline.json"
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
     * Gets followers list from Twitter.
     * Requires user authentication.
     * @param user is the twitter user.
     * @param callback is the object callback, a user from database.
     */
    function getFollowersList(user, callback){
        OAuth.initTwitterOauth(function(oa)
        {
            oa.get(
                "https://api.twitter.com/1.1/followers/list.json?count=200&screen_name=" + user.screen_name
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

    exports.makeTweet = makeTweet;
    exports.getTweet = getTweet;
    exports.makeRetweet = makeRetweet;
    exports.makeUnretweet = makeUnretweet;
    exports.makeFavorite = makeFavorite;
    exports.makeUnfavorite = makeUnfavorite;
    exports.getUserInfo = getUserInfo;
    exports.updateStatistics = updateStatistics;
    exports.getUserFromJWT = getUserFromJWT;
    exports.getOwnTweets = getOwnTweets;
    exports.getAccountTweets = getAccountTweets;
    exports.deleteTweet = deleteTweet;
    exports.searchTweets = searchTweets;
    exports.searchMentions = searchMentions;
    exports.getFollowersList = getFollowersList;

})();