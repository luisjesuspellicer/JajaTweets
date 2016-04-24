/**
 * Created by piraces on 24/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var atob = require('atob');
    var hash = require('string-hash');
    var Shortened = mongoose.model('shortened');
    var User = mongoose.model('users');
    var user_required = require('../../config/policies.config').user_required;


    module.exports = function(app) {

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
         * Gets all shortened URL of the current user.
         * Requires user authentication.
         */
        app.get('/shortened', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                Shortened.find({user: user._id}, function(err,doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Could get shortened links of user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Shortened links obtained successfully",
                                "url": "http://localhost:3000/shortened",
                                "content": doc
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Saves a new shortened URL given an URL in request body, and returns that object.
         * Requires user authentication.
         */
        app.post('/shortened', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                var newHash = hash(req.body.link);
                var newShortened = new Shortened({
                    "link": req.body.link,
                    "hash": newHash,
                    "user": user._id
                });
                newShortened.save(function(err){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Could shorten given link: " + req.body.link,
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "URL successfully shortened",
                                "url": "http://localhost:3000/shortened/" + newHash,
                                "direct_url": "http://localhost:3000/" + newHash,
                                "content": newShortened
                            }
                        });
                        next();
                    }
                });
            });
        }, user_required.after);

        /**
         * Gets a shortened URL by hash.
         * Requires user authentication.
         */
        app.get('/shortened/:id', user_required.before, function(req, res, next) {
            Shortened.find({hash: req.params.id}, function(err,doc){
                if(err){
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Could not get the URL of that hash",
                            "url": "http://localhost:3000/"
                        }
                    });
                    next();
                } else {
                    res.json({
                        "error": false,
                        "data" : {
                            "message": "URL obtained successfully",
                            "url": doc.link,
                            "content": doc
                        }
                    });
                    next();
                }
            });
        }, user_required.after);

        /**
         * Redirects the user to a link by a shorten URL.
         * Do NOT requires user authentication.
         */
        app.get('/s/:encoded_id', function(req, res, next) {
            Shortened.findOne({hash: req.params.encoded_id}, function(err,doc){
                if(err){
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Could not get the URL of that hash",
                            "url": "http://localhost:3000/"
                        }
                    });
                    next();
                } else {
                    res.redirect(doc.link);
                    next();
                }
            });
        });


        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();