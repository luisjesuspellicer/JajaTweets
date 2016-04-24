/**
 * Created by diego on 16/04/16.
 *
 * Contains all the resources offered by the web service's api.
 */
(function() {

    module.exports = {
        // Auth.local offers basic authentication.
        'auth.local': require('./controllers/auth.controller'),
        // users offers RESTfull api to work with users.
        'users': require('./controllers/users.controller')
    };

})();