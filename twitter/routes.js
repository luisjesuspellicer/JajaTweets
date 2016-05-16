/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports the correspondent resource "routers" and their endpoints.
 */
(function() {

    module.exports = {
        'twitter': require('./controllers/twitter.controller.js'),
        'auth.twitter': require('./controllers/auth.controller')
    };

})();