/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: users.model.js
 * Description: Manages basic user information.
 */
(function() {

    'use strict';

    var mongoose = require('mongoose');
    var crypto = require('crypto');
    var jwt = require('jsonwebtoken');


    var userSchema = new mongoose.Schema({
        email: { // Used as key
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        hash: String,
        salt: String,
        token: String,
        secret: String,
        lastAccess: Date,
        tweet_app: Number,
        tweet_total: Number,
        url: String
    });

    // Creates hash and salt from password
    userSchema.methods.setPassword = function(password){
        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    };

    // True if it's a valid password, otherwise false.
    userSchema.methods.validPassword = function(password) {
        var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
        return this.hash === hash;
    };

    // Creates the Jwt from user's info and returns it.
    userSchema.methods.generateJwt = function() {
        var expiry = new Date();
        expiry.setDate(expiry.getDate() + 1);

        return jwt.sign({
            _id: this._id,
            email: this.email,
            name: this.name,
            exp: parseInt(expiry.getTime() / 1000),
        }, process.env.MY_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
    };

    // Export the model.
    module.exports = mongoose.model('users', userSchema, 'users');

})();