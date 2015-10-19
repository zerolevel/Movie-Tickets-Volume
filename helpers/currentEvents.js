var Promise = require("bluebird");
var _ = require("underscore");

module.exports = function(redisClient,events){
    var date = new Date();
    return Promise.map(events,function(eventCode){
        return redisClient.getAsync("event:"+eventCode)
    }).map(function(eventDetail,index){
        eventDetail  = JSON.parse(eventDetail);
        return _.extend(eventDetail,{"id":events[index]});
    }).filter(function(eventDetail,index){
        var releaseDate = Date.parse(eventDetail["releaseDate"]);
        return releaseDate < date;
    }).map(function(eventDetails){
        return eventDetails.id;
    })
};