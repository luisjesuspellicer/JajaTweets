/**
 * Created by diego on 16/04/16.
 */
(function() {

    var Resource = require('resourcejs');

    var jwt = require('express-jwt');
    var auth = jwt({
        secret: process.env.MY_SECRET,
        userProperty: 'payload'
    });


    module.exports = function(app, route) {

        // Setup the controller for REST;
        Resource(app, '', route, app.models.users).rest({
            before: auth,
            after: function(err, req, res, next) {
                if (err && err.name === "UnauthorizedError") {
                    res.status(401).json({
                        'error': false,
                        'message': 'Authentication required!'
                    });
                }
            }
        });

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();