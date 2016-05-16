/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: mentions.controller.js
 * Description: This file contains methods to attend the "mentions" resource and endpoints.
 */
(function() {

    'use strict';

    var user_required = require('../../config/policies.config').user_required;
    var TweetCommons = require('../../common/tweets');

    module.exports = function(app) {

        /**
         * Get the latest mentions of current user in Twitter, using the correspondent Twitter search API endpoint.
         * If there is an error with Twitter, the response contains error status code from Twitter.
         */
        app.get('/mentions', user_required.before, function(req, res, next) {
            TweetCommons.getUserFromJWT(req, function(user){
                if(user) {
                    TweetCommons.searchMentions(user, function (result) {
                        // Error in the interaction with Twitter.
                        if (result.statusCode && result.statusCode != 200) {
                            res.status(result.statusCode).json({
                                "error": true,
                                "data": {
                                    "message": "Cannot search last mentions",
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else {
                            res.json({
                                "error": false,
                                "data": {
                                    "message": "Search mentions successful",
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

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();