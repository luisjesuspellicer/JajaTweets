/**
 * Created by piraces on 22/04/16.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');


    // Ver: https://dev.twitter.com/rest/reference/post/statuses/update
    var tweetsSchema = new mongoose.Schema({
        status: {
            type: String,
            unique: false,
            required: true,
            minlength: 1,
            maxlength: 140
        },
        date: {
            type: Date,
            unique: false,
            required: true
        },
        lat: {
            type: Number,
            unique: false,
            required: false,
            min: -90,
            max: 90
        },
        long: {
            type: Number,
            unique: false,
            required: false,
            min: -180,
            max: 180
        },
        place_id: {
            type: String,
            unique: false,
            required: false
        },
        user: {
            type: String,
            unique: false,
            required: true
        },
        id_str: {
            type: String,
            unique: false,
            required: true
        },
        profile_image_url: {
            type: String,
            unique: false,
            required: true
        },
        screen_name: {
            type: String,
            unique: false,
            required: true
        },
        token: {
            type: String,
            unique: false,
            required: true
        },
        secret: {
            type: String,
            unique: false,
            required: true
        }
    });

    // Export the model.
    module.exports = mongoose.model('tweets', tweetsSchema, 'tweets');

})();