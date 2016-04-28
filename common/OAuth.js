/**
 * Created by piraces on 28/4/16.
 */

(function () {

    var OAuth = require('oauth').OAuth;
    /**
     * Init OAuth object with the twitter application consumer key and secret.
     * It establishes a callback URL to receive Twitter response.
     * @param callback is the callback object, containing the OAuth object initialized.
     */
    function initTwitterOauth(callback) {
        var oa = new OAuth(
            "https://twitter.com/oauth/request_token"
            , "https://twitter.com/oauth/access_token"
            , process.env.TWITTER_CONSUMER_KEY
            , process.env.TWITTER_CONSUMER_SECRET
            , "1.0A"
            , process.env.CURRENT_DOMAIN + "/auth/twitter/callback"
            , "HMAC-SHA1"
        );
        callback(oa);
    }

    exports.initTwitterOauth = initTwitterOauth;

})();