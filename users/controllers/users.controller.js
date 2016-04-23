/**
 * Created by diego on 16/04/16.
 */
(function () {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');

    module.exports = function (app, route) {

        var admin_required = require('../../config/policies.config').admin_required;
        var admin_or_self_required = require('../../config/policies.config').admin_or_self_required;

        // Setup the controller for REST;
        var resource = Resource(app, '', route, app.models.users)
            .get(admin_or_self_required)
            .put(admin_or_self_required)
            .delete(admin_or_self_required)
            .index(admin_required);

        resource.register(app, 'post', '/users', createUser, resource.respond.bind(resource), admin_required);

        // Add register option
        function createUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save(function (err) {
                var token;
                token = user.generateJwt();
                return resource.setResponse(res,
                    {
                        status: 200,
                        item: {
                            "error": false,
                            "data": {
                                "token": token,
                                "url": "http://localhost:3000/login"
                            }
                        }
                    }, next);
            });
        }

        // Return middleware.
        return function (req, res, next) {
            next();
        };
    };

})();