/**
 * Authors: Diego Ceresuela, Raúl Piracés and Luis Jesús Pellicer.
 * Date: 16-05-2016
 * Name file: index.js
 * Description: This file exports the correspondent resource "model".
 */
(function() {
    'use strict';

    module.exports = {
        twitter: require('./twitter.model.js')
    };

})();