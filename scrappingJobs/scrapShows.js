/**
 * Created by mohit on 8/10/15.
 */
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

var scrapShowsForCity = function(redisClient,mongoDb,cityCode){
    var eventsRC = new EventsRC(redisClient);
    var date = new Date();
    var dateCode = DateCode(date);
    var updateShows = new Update_shows(redisClient, mongoDb);
    return eventsRC.getEvents(cityCode,date).then(function(events){
        return currentEvents(redisClient,events);
    }).map(function(event) {
        return updateShows.insertAllShows(event, cityCode, date, false).catch(function(e){
            handleError(e.stack,event,cityCode);
        });
    });
};

var scrapShows = function() {
    var url = 'mongodb://localhost:27017/bms';
    var redisClient = Promise.promisifyAll(redis.createClient());

    var mongoDb = MongoClient.connect(url,{promiseLibrary:Promise});
    return mongoDb.then(function(){
        var regionsRC = new RegionsRC(redisClient);
        return regionsRC.getAllRegionCodes()
    }).map(function(cityCode){
        return scrapShowsForCity(redisClient,mongoDb.value(),cityCode);
    },{concurrency:30}).then(function(){
        mongoDb.value().close();
        redisClient.end();
    }).then(function(){
        return reportUpdates("Shows Scrapped");
    }).catch(function(e){
        handleError("scrapShows",e);
    })
};

module.exports = scrapShows;
//scrapShows();