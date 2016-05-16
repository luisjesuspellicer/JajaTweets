/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: twitter.model.js
 * Description: This file contains the mongoose model for "twitter" resource.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');

    var twitterSchema = new mongoose.Schema({
        user: {
            type: String,
            required: true,
            unique: false
        },
        in_use: {
            type: Boolean,
            required: true,
            unique: false
        },
        token: {
            type: String,
            required: true,
            unique: true
        },
        secret: {
            type: String,
            required: true,
            unique: true
        },
        description: String,
        screen_name: String,
        name: String,
        id_str: String,
        location: String,
        url: String,
        followers_count: Number,
        friends_count: Number,
        favourites_count: Number,
        statuses_count: Number,
        profile_image_url: String,
        subscribed: Object,
        tweet_app: {
            type: Number,
            required: true,
            unique: false
        }
    });

    // Export the model.
    module.exports = mongoose.model('twitter', twitterSchema, 'twitter');

})();