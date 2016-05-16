/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file contains all the resources offered by the web service's api.
 */
(function() {

    module.exports = {
        // Auth.local offers basic authentication.
        'auth.local': require('./controllers/auth.controller'),
        // users offers RESTful api to work with users.
        'users': require('./controllers/users.controller')
    };

})();