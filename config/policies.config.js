/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: policies.config.js
 * Description: This file contains all the security policies supported by the endpoints
 *      user_required:              Any logged user can access to the endpoint
 *      admin_or_self_required:     Only the admin can access or an user if it is his own resource
 *      admin_required:             Only the admin can acces to the endpoint
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
     * Adds an URL in the REST response if it's not present (making it RESTful).
     * @param req
     * @param res
     * @param next
     */
    var add_url = function(req, res, next) {
        next();
    };

    /**
     * Requires admin authentication.
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
                        "url": process.env.CURRENT_DOMAIN + "/login"
                    }
                })
        } else {
            next();
        }
    };

    /**
     * Handles unauthenticated error.
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
                    "url": process.env.CURRENT_DOMAIN + "/login"
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
                            "url": process.env.CURRENT_DOMAIN + "/login"
                        }
                    })
            } else {
                next();
            }

        } else {
            next();
        }
    };

    // Exports the security policies
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