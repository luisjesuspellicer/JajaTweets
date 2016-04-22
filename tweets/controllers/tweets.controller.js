/**
 * Created by piraces on 22/04/16.
 */
(function() {

    'use strict';

    var passport = require('passport');
    var mongoose = require('mongoose');
    var Tweet = mongoose.model('tweets');

    module.exports = function(app) {

        app.get('/tweets',function(req, res, next) {

        });

        app.post('/tweets',function(req, res, next) {

        });

        app.get('/tweets/:id',function(req, res, next) {

        });

        app.put('/tweets/:id',function(req, res, next) {

        });

        app.delete('/tweets/:id',function(req, res, next) {

        });

        app.get('/tweets/:id/retweet',function(req, res, next) {

        });

        app.get('/tweets/own',function(req, res, next) {

        });

        app.get('/tweets/pending',function(req, res, next) {

        });

        app.get('/tweets/subscribed',function(req, res, next) {

        });

        app.get('/tweets/subscribed/:id',function(req, res, next) {

        });
        
        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();