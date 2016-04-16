/**
 * Created by diego on 16/04/16.
 */
(function() {

    var Resource = require('resourcejs');

    module.exports = function(app, route) {

        // Setup the controller for REST;
        Resource(app, '', route, app.models.users).rest();

        // Return middleware.
        return function(req, res, next) {
            next();
        };
    };

})();