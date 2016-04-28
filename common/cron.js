/**
 * Created by piraces on 28/4/16.
 */
(function () {

    var mongoose = require('mongoose');
    var CronJob = require('cron').CronJob;
    var OAuth = require('./oauth');
    var date = new Date();

    function startCron() {
        var Tweet = mongoose.model('tweets');
        new CronJob('00 * * * * *', function () {
            Tweet.find({}, function (err, result) {
                for (var tweet in result) {
                    if (result[tweet].date < date) {
                        OAuth.initTwitterOauth(function(oa){
                            oa.post(
                                "https://api.twitter.com/1.1/statuses/update.json"
                                , result[tweet].token
                                , result[tweet].secret
                                // Tweet content
                                , {
                                    "status": result[tweet].status
                                }
                                , function (error, data, response) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log("Cron sent tweet: " + JSON.stringify(data));
                                    }
                                }
                            );
                            // Enviar tweet con el token.
                            // Eliminar el tweet de la bd.
                            Tweet.findOneAndRemove({
                                _id: result[tweet].id,
                                user: result[tweet].user
                            }, function (err, tweet) {
                                if (err) {
                                    console.log("Cannot delete pending tweet");
                                } else if (tweet == null) {
                                    console.log("This pending tweet doesn't exists");
                                }
                            });
                        });
                    }
                }
            });
        }, null, true, 'Europe/Madrid');
    }

    exports.startCron = startCron;

})();