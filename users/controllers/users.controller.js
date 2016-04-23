/**
 * Created by diego on 16/04/16.
 */
(function () {

    var Resource = require('resourcejs');
    var passport = require('passport');
    var mongoose = require('mongoose');
    var User = mongoose.model('users');
    var http = require('http');
    var _ = require('lodash');
    var jwt = require('jsonwebtoken');

    module.exports = function (app, route) {

        var admin_required = require('../../config/policies.config').admin_required;
        var admin_or_self_required = require('../../config/policies.config').admin_or_self_required;
        var delete_options = _.cloneDeep(admin_or_self_required);
        // Analytics to update with delete operation
        delete_options.after.push(function (req, res, next) {
            updateUsers(-1, jwt.sign(req.payload, process.env.MY_SECRET));
            next(); }
        );

        // Setup the controller for REST;
        var resource = Resource(app, '', route, app.models.users)
            .get(admin_or_self_required)
            .put(admin_or_self_required)
            .delete(delete_options)
            .index(admin_required);

        resource.register(app, 'post', '/users', createUser, resource.respond.bind(resource), admin_required);
        resource.register(app, 'get', '/users:last', getLastUsers, resource.respond.bind(resource), admin_required);

        // Add register option
        function createUser(req, res, next) {
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            user.save(function (err) {
                var token;
                token = user.generateJwt();
                updateUsers(1,token);
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

    function getLastUsers(req, res, next) {
        User.find({}).sort({lastAccess: -1}).limit(20).exec(
            function(err, users) {
                res.status(200).json(users);
            }
        );
    }

    /**
     * Uses the Analytics API so as to update subunsub data
     * @param {Numeric} num
     * @param {String} token
     */
    function updateUsers(num,token) {
        http.request({ method: 'get',  port: 3000,  path:'/data',
            headers: {
                'Content-type': 'application/json',
                'Authorization': 'Bearer '+token
            }
        }, function (res) {
            var result = "";
            res.on('data', function (chunk) {
                result += chunk.toString();
            });
            res.on('end', function() {
                var i = 0;

                var data = JSON.parse(result);
                do {
                    if (data[i].name == "subunsub") {
                        if (num>0) data[i].chart[0].value++;
                        else { data[i].chart[1].value++ }
                        var req = http.request({ method: 'put',  port: 3000,  path:'/data/'+data[i]._id,
                            headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer '+token
                            }
                        });
                        req.write(JSON.stringify(data[i]));
                        req.end();
                    }
                    i++;
                } while (i < data.length && data[i].name != "subunsub");
            })
        }).end();
    }

})();