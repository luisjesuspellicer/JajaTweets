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
         * Search mentions of specific user from Twitter by unique id.
         * Requires user authentication.
         * @param user is the local user.
         * @param callback is the callback object, containing the resultant mentions data (searched mention tweets).
         */
        function searchMentions(user, callback){
            initTwitterOauth(function(oa)
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
         * Get the latest mentions of current user in twitter.
         *
         * (Checked)
         */
        app.get('/mentions', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                searchMentions(user, function(result){
                    if(result.statusCode && result.statusCode != 200){
                        res.status(result.statusCode).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot search last mentions",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Search mentions successful",
                                "url": "http://localhos:3000/tweets",
                                "content": result
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