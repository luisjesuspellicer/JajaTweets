/**
 * Authors: Diego Ceresuela, Luis Jesús Pellicer, Raúl Piracés.
 * Date: 16-05-2016
 * Name file: cron.js
 * Description: Start a cron to check the date of pending tweets
 * (send to Twitter API and refresh statics).
 */
(function () {

    var mongoose = require('mongoose');
    var CronJob = require('cron').CronJob;
    var OAuth = require('./OAuth');

    function startCron() {

        // Mongodb models.
        var Tweet = mongoose.model('tweets');
        var TweetCommons = require('./tweets');

        // Each minute.
        new CronJob('*/1 * * * * *', function () {
            var date = new Date();
            Tweet.find({}, function (err, result) {
                for (var tweet in result) {
                    var id_str = result[tweet].id_str;
                    var user =
                    {token: result[tweet].token, secret: result[tweet].secret,
                        user: result[tweet].user};

                    // If date is bigger than tweet's date, post it.
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
                                        console.log("Cron sent tweet: "
                                            + JSON.stringify(data));
                                        
                                        // Update statistics
                                        TweetCommons.updateStatistics(user,id_str,1);

                                        // Delete tweet from DB
                                        Tweet.findOneAndRemove({
                                            _id: result[tweet].id,
                                            user: result[tweet].user
                                        }, function (err, tweet) {
                                            if (err) {
                                                console.log("Cannot delete " +
                                                    "pending tweet");
                                            } else if (tweet == null) {
                                                console.log("This pending " +
                                                    "tweet doesn't exists");
                                            }
                                        });
                                    }
                                }
                            );
                        });
                    }
                }
            });
        }, null, true, 'Europe/Madrid'); // timeZone
    }

    exports.startCron = startCron;

})();