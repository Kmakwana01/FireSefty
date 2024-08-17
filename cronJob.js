var GROUP_PLAY = require('./models/appGroupPlayModel');
var cron = require('node-cron');
var moment = require('moment');

exports.statusChangeForGroupPlay = async function (req, res, next) {
    cron.schedule('* * * * * *', async () => {
        var groupPlay = await GROUP_PLAY.find({ gameStatus : 'upComing' , playType : 'playLater' });
        for (const game of groupPlay) {
            var currentTime = moment();
            var playLaterTime = moment(Number(game.playLaterTime));

            if (currentTime.isAfter(playLaterTime)) {
                await GROUP_PLAY.findByIdAndUpdate(game._id,{
                    gameStatus : 'running'
                    //playType : 'playNow'
                },{new : true});
            }
        }
    });
}