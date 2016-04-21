/**
 * Created by diego on 16/04/16.
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

        var webservices = require('./webservices');
        webservices.forEach(function(ws){
           app.models = _.extend(app.models,require('./'+ws+'/models/index'));
        });

        require('./config/passport.config');
        app.use(passport.initialize());

        var routes = {};
        webservices.forEach(function(ws){
            routes = _.extend(routes,require('./'+ws+'/routes'));
        });

        _.each(routes, function(controller, route){
            app.use(route,controller(app, route));
        });

        // Static content
        app.use(express.static('app'));

        console.log('Listening on port 3000...');
        app.listen(3000);
    });

})();
