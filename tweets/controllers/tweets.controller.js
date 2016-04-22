/**
 * Created by piraces on 22/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Tweet = mongoose.model('tweets');

    module.exports = function(app) {

        // Luis
        app.get('/tweets',function(req, res, next) {

        });

        // Raúl
        app.post('/tweets',function(req, res, next) {

        });

        // Raúl
        app.get('/tweets/:id',function(req, res, next) {

        });

        // Luis
        app.put('/tweets/:id',function(req, res, next) {

        });

        // Luis
        app.delete('/tweets/:id',function(req, res, next) {

        });

        // Raúl
        app.get('/tweets/:id/retweet',function(req, res, next) {

        });

        // Luis
        app.get('/tweets/own',function(req, res, next) {

        });

        // Luis
        app.get('/tweets/pending',function(req, res, next) {

        });

        // Raúl
        app.get('/tweets/subscribed',function(req, res, next) {

        });

        // Raúl
        app.get('/tweets/subscribed/:id',function(req, res, next) {

        });
        
        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();