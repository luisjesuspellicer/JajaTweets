/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports all functions and routes of this webservice resources.
 */
(function() {

    module.exports = {
        'shortened': require('./controllers/shortened.controller.js')
    };

})();