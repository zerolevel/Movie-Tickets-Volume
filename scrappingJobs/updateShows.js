var MongoClient = require('mongodb').MongoClient;
var Update_shows = require("../db_connectors/updateShows.js");
var Promise = require("bluebird");
var EventsRC = require("../db_connectors/events.js");
var redis = require("redis");
var DateCode = require("../helpers/dateCode");
var _ = require("underscore");
var currentEvents = require("../helpers/currentEvents");
var RegionsRC = require("../db_connectors/regions.js");
var handleError = require("../helpers/handleError");
var reportUpdates = require("../helpers/reportUpdates");

var updateShowsForCity = function(redisClient,mongoDb,cityCode,date){
    var eventsRC = new EventsRC(redisClient);
    var dateCode = DateCode(date);
    var updateShows = new Update_shows(redisClient, mongoDb);
    return eventsRC.getEvents(cityCode,date).then(function(events){
        return currentEvents(redisClient,events);
    }).map(function(event) {
        console.log(event, cityCode);
        return updateShows.updateAllShows(event, cityCode, date, false).catch(function(e){
            handleError("updateShows",e);
        });
    });
};

var updateShows = function(date) {
    var url = 'mongodb://localhost:27017/bms';
    var redisClient = Promise.promisifyAll(redis.createClient());

    var mongoDb = MongoClient.connect(url,{promiseLibrary:Promise});
    mongoDb.then(function(){
        var regionsRC = new RegionsRC(redisClient);
        return regionsRC.getAllRegionCodes()
    }).map(function(cityCode){
        return updateShowsForCity(redisClient,mongoDb.value(),cityCode,date);
    },{concurrency:30}).then(function(){
        return reportUpdates("Shows Updated");
    }).then(function(){
        mongoDb.value().close();
        redisClient.end();
    }).catch(function(e){
        handleError("updateShows",e);
    })
};

module.exports = updateShows;
//updateShows();