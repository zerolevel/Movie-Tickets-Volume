var Promise = require("bluebird");
var EventsRC = require("../db_connectors/events.js");
var redis = require("redis");
var handleError = require("../helpers/handleError");
var reportUpdates = require("../helpers/reportUpdates");

//has to be scheduled everyday.
var scrapEvents = function(){
    var date = new Date();
    var redisClient = Promise.promisifyAll(redis.createClient());
    var eventsRC = new EventsRC(redisClient);
    return eventsRC.populateEvents(date)
        .then(function(){
            return reportUpdates("Events Scrapped");
        }).then(function(){
            redisClient.end();
        }).catch(function(e){
            handleError("scrapEvents",e);
        })
};

module.exports = scrapEvents;
//scrapEvents();