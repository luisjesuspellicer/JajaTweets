/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');

    module.exports = function(app) {

        // Session with Twitter
        app.get('/auth/twitter',
            passport.authenticate('twitter'));

        // Callback received from twitter
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', { failureRedirect: '/login' }),
            function(req, res) {
                // Successful authentication, redirect home.
                res.redirect('/');
            });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();