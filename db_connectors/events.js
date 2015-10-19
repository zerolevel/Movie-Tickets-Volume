var eventsSAS = require("../bmsScrappers/events"); //api from Scrap All Shows
var RegionsRC = require("./regions");
var Promise = require("bluebird");
var DateCode = require("../helpers/dateCode");
var _ = require("underscore");

module.exports = function(redisClient){
    if (!redisClient) {
        throw Error("Redis Client Not Specified");
    }
    this.populateEventsForCity = function(cityCode,dateCode) {
        var date = new Date();
        return eventsSAS(cityCode).then(function(eventsInCity){
           var eventIdsInCity = eventsInCity.filter(function(event){
               return Date.parse(event.releaseDate) < date;
           }).map(function(event){
               return  event.id;
           });
           return redisClient.saddAsync("events:" + dateCode + ":" + cityCode,eventIdsInCity)
           .catch(function(){
               return eventsInCity;
           }).then(function(){
               return eventsInCity;
           });
       });
    };
    this.populateEventDetails = function(eventsObject) {
        var events = Object.keys(eventsObject);
        return Promise.each(events, function(v,callback){
            return redisClient.setAsync("event:"+v,JSON.stringify(eventsObject[v]));
        });
    };
    this.populateEvents = function(date) {
        var self = this;
        var events = {};
        var dateCode = DateCode(date);
        var regionsRC = new RegionsRC(redisClient);
        return regionsRC.getAllRegionCodes().then(function(codes){
            return Promise.map(codes,function(cityCode){
                return self.populateEventsForCity(cityCode,dateCode).then(function(eventsInCity){
                    eventsInCity.map(function(eventDetails){
                        events[eventDetails.id] = _.pick(eventDetails,"movieName","releaseDate");
                    })
                })
            }).then(function(){
                return self.populateEventDetails(events);
            }).then(function(){
                return events;
            })
        })
    };

    //the database must be populated, otherwise resolves the promise with null
    this.getEvents = function(cityCode, date) {
        var dateCode = DateCode(date);
        var regionsRC = new RegionsRC(redisClient);
        return regionsRC.checkCityCode(cityCode)
        .then(function() {
           return redisClient.smembersAsync("events:" + dateCode + ":" + cityCode)
        });
    };
};
