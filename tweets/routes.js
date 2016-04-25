/**
 * Created by piraces on 22/04/16.
 */
(function() {

    module.exports = {
        'tweets': require('./controllers/tweets.controller.js'),
        'mentions': require('./controllers/mentions.controller'),
        'subscriptions': require('./controllers/subscriptions.controller')
    };

})();