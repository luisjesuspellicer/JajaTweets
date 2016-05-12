/**
 * Created by piraces on 25/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var request = require('request');
    var atob = require('atob');
    var hash = require('string-hash');
    var Shortened = mongoose.model('shortened');
    var Twitter = mongoose.model('twitter');
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
            Twitter.findOne({user: payload.email}, function(err, doc){
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
         *
         * (Checked)
         */
        app.get('/shortened', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                Shortened.find({user: user.user}, function(err,doc){
                    if(err){
                        res.status(500).json({
                            "error": true,
                            "data" : {
                                "message": "Could get shortened links of user",
                                "url": process.env.CURRENT_DOMAIN
                            }
                        });
                        next();
                    } else {
                        res.json({
                            "error": false,
                            "data" : {
                                "message": "Shortened links obtained successfully",
                                "url": process.env.CURRENT_DOMAIN + "/shortened",
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
         *
         * (Checked)
         */
        app.post('/shortened', user_required.before, function(req, res, next) {
            getUserFromJWT(req, function(user){
                var newHash;
                try {
                    newHash = hash(req.body.link);
                } catch(ex){
                    res.status(400).json({
                        "error": true,
                        "data": {
                            "message": "Given link isn't a valid URL",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                }
                if(newHash) {
                    Shortened.findOne({hash: newHash, user: user.user}, function (err, doc) {
                        if (err) {
                            res.status(500).json({
                                "error": true,
                                "data": {
                                    "message": "Could shorten given link: " + req.body.link,
                                    "url": process.env.CURRENT_DOMAIN
                                }
                            });
                            next();
                        } else if (doc != null) {
                            res.status(400).json({
                                "error": true,
                                "data": {
                                    "message": "URL already shortened by user: " + req.body.link,
                                    "url": process.env.CURRENT_DOMAIN,
                                    "content": doc
                                }
                            });
                            next();
                        } else {
                            var newShortened = new Shortened({
                                "link": req.body.link,
                                "hash": newHash,
                                "user": user.user
                            });
                            newShortened.save(function (err) {
                                if (err) {
                                    res.status(500).json({
                                        "error": true,
                                        "data": {
                                            "message": "Could shorten given link: " + req.body.link,
                                            "url": process.env.CURRENT_DOMAIN
                                        }
                                    });
                                    next();
                                } else {
                                    res.json({
                                        "error": false,
                                        "data": {
                                            "message": "URL successfully shortened",
                                            "url": process.env.CURRENT_DOMAIN + "/shortened/" + newHash,
                                            "direct_url": process.env.CURRENT_DOMAIN + "/s/" + newHash,
                                            "content": newShortened
                                        }
                                    });
                                    next();
                                }
                            });
                        }
                    });
                }
            });
        }, user_required.after);

        /**
         * Gets a shortened URL by hash.
         * Requires user authentication.
         *
         * (Checked)
         */
        app.get('/shortened/:id', user_required.before, function(req, res, next) {
            Shortened.findOne({hash: req.params.id}, function(err,doc){
                if(err){
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Could not get the URL of that hash",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                } else if(doc == null){
                    res.status(404).json({
                        "error": true,
                        "data" : {
                            "message": "The hash doesn't exists",
                            "url": process.env.CURRENT_DOMAIN
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
         * Deletes a shortened URL by hash.
         * Requires user authentication.
         *
         * (Checked)
         */
        app.delete('/shortened/:id', user_required.before, function(req, res, next) {
            Shortened.findOneAndRemove({hash: req.params.id}, function(err,doc){
                if(err){
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Could not delete the shortened URL",
                            "url": process.env.CURRENT_DOMAIN
                        }
                    });
                    next();
                } else if(doc==null){
                    res.status(404).json({
                        "error": true,
                        "data" : {
                            "message": "Could not found the shortened URL",
                            "url": process.env.CURRENT_DOMAIN + "/shortened"
                        }
                    });
                    next();
                } else {
                    res.json({
                        "error": false,
                        "data" : {
                            "message": "Shortened URL deleted successfully",
                            "url": process.env.CURRENT_DOMAIN + "/shortened",
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
         *
         * (Checked)
         */
        app.get('/s/:encoded_id', function(req, res, next) {
            Shortened.findOne({hash: req.params.encoded_id}, function(err,doc){
                if(err){
                    res.status(500).json({
                        "error": true,
                        "data" : {
                            "message": "Could not get the URL of that hash",
                            "url": process.env.CURRENT_DOMAIN
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