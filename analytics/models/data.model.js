/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: test.js
 * Description: This file contains mongoose model for "data" resource.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');

    var dataSchema = new mongoose.Schema({
        chart: {},
        name: String
    });

    module.exports = mongoose.model('data',dataSchema,'data');

})();