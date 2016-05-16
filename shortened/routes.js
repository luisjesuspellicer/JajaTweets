/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports the correspondent resource "routers" and their endpoints.
 */
(function() {

    module.exports = {
        'shortened': require('./controllers/shortened.controller.js')
    };

})();