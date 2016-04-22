/**
 * Created by diego on 22/04/16.
 */
(function() {
    'require strict';

    var jwt = require('express-jwt');
    var _ = require('lodash');

    var auth = jwt({
        secret: process.env.MY_SECRET,
        userProperty: 'payload'
    });

    var addUrl = function(req, res, next) {
        if (res && res.resource.item && res.resource.item && !res.resource.item.url) {
            res.resource.item.url = "http://localhost:3000/login";
        }
        next();
    };

    exports.admin_required = {
        before: [auth,function (req, res, next) { // Need to be admin
            if (req.payload && req.payload.email != "test@test") {
                res.status(401)
                    .json({
                        "error": false,
                        "data": {
                            "message": "Insufficient privileges.",
                            "url": "http://localhost:3000/login"
                        }
                    })
            } else {
                next();
            }
        }],
        after: [function (err, req, res, next) { // Need to be authenticated
            if (err && err.name === "UnauthorizedError") {
                res.status(401).json({
                    "error": false,
                    "data": {
                        "message": "Authentication required.",
                        "url": "http://localhost:3000/login"
                    }
                })
            } else {
                next();
            }
        }, addUrl] // Url required in REST
    };

    exports.admin_or_self_required = _.cloneDeep(exports.admin_required);
    exports.admin_or_self_required['before'][1] = function (req, res, next) { // Need to be admin
        if (req.path && req.payload) {
            var _id = req.path.substr(req.path.lastIndexOf('/')+1);
            if ( _id != req.payload._id && req.payload.email != "test@test") {
                res.status(401)
                    .json({
                        "error": false,
                        "data": {
                            "message": "Insufficient privileges.",
                            "url": "http://localhost:3000/login"
                        }
                    })
            } else {
                next();
            }

        } else {
            next();
        }
    };


})();