/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: test.js
 * Description: This file acquires all test files from other webservices (for testing all at once).
 */
(function() {
    'use strict';

    var webservices = require('../webservices');

    webservices.forEach(function(ws){

        require('../'+ws+'/test');
    })
})();
