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
    var session = require('express-session');
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var methodOverride = require('method-override');
    var _ = require('lodash');
    var passport = require('passport');
    var Cron = require('./common/cron');
    // Create the application.
    var app = express();
    var request = require('request');
    // Add Middleware necessary for REST API's
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));
    var OAuth = require('oauth').OAuth;
    // Connect to MongoDB, selects between environment variable (Heroku DB) or other (custom DB)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:mongomongo1@ds013981.mlab.com:13981/heroku_vw307h03');
    mongoose.connection.once('open', function() {

        // Load all the models
        var webservices = require('./webservices');
        webservices.forEach(function(ws){
           app.models = _.extend(app.models,require('./'+ws+'/models/index'));
        });

        // Load passport module
        require('./config/passport.config');

        // Authentication configuration
        app.use(session({
            resave: false,
            saveUninitialized: true,
            name: "id",
            jwt: null,
            secret: process.env.MY_SECRET
        }));
        app.use(cookieParser());
        app.use(passport.initialize());
        app.use(passport.session());

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

        // Listen in the port specified, environment variable for Heroku, or custom on localhost
        app.listen(process.env.PORT || 3000);
        console.log('Server has started...');

        // Starts cron process for pending tweets
        Cron.startCron();
        
    });

})();
