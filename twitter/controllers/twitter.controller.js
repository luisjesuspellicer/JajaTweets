/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Twitter = mongoose.model('twitter');
    var User = mongoose.model('users');
    var atob = require('atob');
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
         */
        app.post('/twitter', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                Twitter.create(req.body, function(err){
                    if(err){
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
         * Gets one twitter accounts of current user (by unique id).
         * Local user authentication required.
         */
        app.get('/twitter/:id', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                Twitter.findOne({user: user.email, id_str: req.params.id}, function(err, doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Cannot get this twitter account for current user",
                                "url": "http://localhost:3000/"
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Twitter account retrieved successfully",
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
         * Set to use one twitter accounts of current user (by unique id).
         * Local user authentication required.
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
                                "message": "Now using twitter account: " + doc.screen_name,
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
         * Set to not use one twitter accounts of current user (by unique id).
         * Local user authentication required.
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