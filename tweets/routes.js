/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: routes.js
 * Description: This file exports the correspondent resource "routers" and their endpoints.
 */
(function() {

    module.exports = {
        'tweets': require('./controllers/tweets.controller.js'),
        'mentions': require('./controllers/mentions.controller'),
        'subscriptions': require('./controllers/subscriptions.controller')
    };

})();