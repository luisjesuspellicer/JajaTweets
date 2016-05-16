/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports the correspondent resource "routers" and their endpoints.
 */
(function() {

    module.exports = {
        // Auth.local offers basic authentication.
        'auth.local': require('./controllers/auth.controller'),
        // users offers RESTfull api to work with users.
        'users': require('./controllers/users.controller')
    };

})();