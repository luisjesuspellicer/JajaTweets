/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: shortened.model.js
 * Description: This file contains the mongoose model for "shortened" resource.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');

    var shortenedSchema = new mongoose.Schema({
        link: {
            type: String,
            unique: false,
            required: true
        },
        hash: {
            type: String,
            unique: false,
            required: true
        },
        user: {
            type: String,
            unique: false,
            required: true
        }
    });

    // Export the model.
    module.exports = mongoose.model('shortened', shortenedSchema, 'shortened');

})();