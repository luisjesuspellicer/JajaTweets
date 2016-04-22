/**
 * Created by piraces on 22/4/16.
 */
(function() {

    'use strict';

    var passport = require('passport');

    module.exports = function(app) {

        // Raúl o Luis
        app.get('/mentions',function(req, res, next) {

        });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();