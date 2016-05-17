/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: twitter.js
 * Description: Provides functions to interact with Twitter API and User resource.
 */

(function () {

    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var User = mongoose.model('users');
    var atob = require('atob');
    var TweetCommons = require('./tweets');

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
     * Updates statistics of local saved twitter account (all util fields).
     * @param user is the local user object.
     * @param id is the twitter id user.
     * @param num_app is the number to add to the local total tweets statistic.
     * @param callback is the callback object
     */
    function updateStatistics(user, id, num_app, callback){
        TweetCommons.getUserInfo(user, id, function(result){
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
                        callback();
                    }
                    callback();
                });
        });
    }

    /**
     * Function that sets status of all twitter accounts (of current user) to "in_use" false.
     * @param req is the received request.
     * @param callback is the callback object (can contain update error).
     */
    function notUseAnyAccount(req, callback){
        getUserFromJWT(req, function(user){
            Twitter.update({user: user.email}, {$set: {in_use: false}}, {multi: true}, function(err){
                if(err){
                    callback(err);
                } else {
                    callback();
                }
            });
        });
    }

    exports.updateStatistics = updateStatistics;
    exports.getUserFromJWT = getUserFromJWT;
    exports.notUseAnyAccount = notUseAnyAccount;

})();