/**
 * Created by diego on 16/04/16.
 */
(function() {

    module.exports = {
        'auth.local': require('./controllers/auth.controller'),
        'users': require('./controllers/users.controller')
    };

})();