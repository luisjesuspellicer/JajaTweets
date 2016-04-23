/**
 * Created by diego on 22/04/16.
 */
(function() {
    'use strict';

    var jwt = require('express-jwt');
    var _ = require('lodash');

    var require_auth = jwt({
        secret: process.env.MY_SECRET,
        userProperty: 'payload'
    });

    /**
     * Adds an URL in the REST response if it's not present
     * @param req
     * @param res
     * @param next
     */
    var add_url = function(req, res, next) {
        next();
    };

    /**
     * Requires admin authentication
     * @param req
     * @param res
     * @param next
     */
    var require_admin = function (req, res, next) { // Need to be admin
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
    };

    /**
     * Handles unauthenticated error
     * @param err
     * @param req
     * @param res
     * @param next
     */
    var handle_error = function (err, req, res, next) { // Need to be authenticated
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
    };

    /**
     * Requires admin authentication or user authentication if owns the resource.
     * @param req
     * @param res
     * @param next
     */
    var self_or_admin = function (req, res, next) { // Need to be admin or resource_id = user_id
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

    //////////////////

    exports.admin_required = { // Just admin can access
        before: [require_auth,require_admin],
        after: [handle_error, add_url]
    };

    exports.admin_or_self_required = { // Admin or self can access
        before: [require_auth,self_or_admin],
        after: [handle_error, add_url]
    };

    exports.user_required = { // Any authenticated user can access
        before: [require_auth],
        after: [handle_error, add_url]
    };


})();