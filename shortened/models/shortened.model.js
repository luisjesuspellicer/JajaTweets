/**
 * Created by piraces on 24/04/16.
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