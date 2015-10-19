var _ = require("underscore");

module.exports = function(redisClient,shows,eventCode){
    var eventDetails = {};
    return redisClient.getAsync("event:"+eventCode)
    .then(function(eventDetail){
        eventDetail = JSON.parse(eventDetail);
        return shows.map(function(show) {
            return _.extend(show, eventDetail)
        });
    });
};