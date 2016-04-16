/**
 * Created by diego on 16/04/16.
 */
(function() {
    'use strict';

    var mongoose = require('mongoose');

    // Create the MovieSchema.
    var UserSchema = new mongoose.Schema({
        'username': String,
        'password': String,
        'email': String
    });

    // Export the model.
    module.exports = mongoose.model('users', UserSchema, 'users');

})();