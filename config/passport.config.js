/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: passport.config.js
 * Description: This file contains passport package configuration (strategies and configurations).
 */
(function (){
    'use strict';

    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var TwitterStrategy = require('passport-twitter').Strategy;
    var mongoose = require('mongoose');
    var User = mongoose.model('users');

    /**
     * Local authentication using "LocalStrategy" and local data.
     */
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        function(username, password, done) {
            User.findOne({ email: username }, function (err, user) {
                if (err) { return done(err); }
                // Return if user not found in database
                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }
                // Return if password is wrong
                if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Password is wrong'
                    });
                }
                // If credentials are correct, return the user object
                return done(null, user);
            });
        }
    ));

    /**
     * Twitter authentication using "TwitterStrategy" and twitter data (app keys and configurations).
     */
    passport.use(new TwitterStrategy({
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: process.env.CURRENT_DOMAIN + "/auth/twitter/callback"
        },
        function(token, tokenSecret, profile, cb) {
            // Returns twitter token and secret for one account.
            return cb(null, {"token": token, "tokenSecret": tokenSecret, "profile": profile});
        }
    ));

    // For passport sessions
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // For passport sessions
    passport.deserializeUser(function(id, done) {
        done(null, id);
    });


})();