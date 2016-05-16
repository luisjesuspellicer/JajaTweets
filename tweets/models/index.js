/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: index.js
 * Description: This file exports the correspondent resource model.
 */
(function() {
    'use strict';

    module.exports = {
        tweets: require('./tweets.model.js')
    };

})();