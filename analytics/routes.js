/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports routes controllers for the resources in this webservice.
 */
(function() {

    module.exports = {
        'data': require('./controllers/data.controller.js')
    };

})();