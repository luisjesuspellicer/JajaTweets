/**
 * Created by Diego on 16/04/16.
 *
 * Launches all the web services listed in webservices,js
 *  PORT = 3000
 *  STATIC_CONTENT = ./app
 */
(function() {

    'use strict';

    var express = require('express');
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var _ = require('lodash');
    var passport = require('passport');

    // Create the application.
    var app = express();

    // Add Middleware necessary for REST API's
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));

    // Connect to MongoDB
    mongoose.connect('mongodb://localhost/meanapp');
    mongoose.connection.once('open', function() {

        // Load all the models
        var webservices = require('./webservices');
        webservices.forEach(function(ws){
           app.models = _.extend(app.models,require('./'+ws+'/models/index'));
        });

        // Load passport module
        require('./config/passport.config');
        app.use(passport.initialize());

        // Load all the routes
        var routes = {};
        webservices.forEach(function(ws){
            routes = _.extend(routes,require('./'+ws+'/routes'));
        });

       // Configure all the endpoints
        _.each(routes, function(controller, route){
            app.use(route,controller(app, route));
        });

        // Static content
        app.use(express.static('app'));

        console.log('Listening on port 3000...');
        app.listen(process.env.PORT || 3000);
    });

})();
