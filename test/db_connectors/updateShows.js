var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Update_shows = require("../../db_connectors/updateShows.js");
var Promise = require("bluebird");
var EventsRC = require("../../db_connectors/events.js");
var redis = require("redis");
var DateCode = require("../../helpers/dateCode");
var _ = require("underscore");
var currentEvents = require("../../helpers/currentEvents");

describe("db_connectors: Update Shows", function(){
    this.timeout(2000000);
    var mongoDb;
    var redisClient;
    beforeEach(function(done){
       var url = 'mongodb://localhost:27017/test';
        redisClient = Promise.promisifyAll(redis.createClient());
       MongoClient.connect(url).then(function(db){
           mongoDb = db;
           done();
       });
    });

    describe("insertAllShows()",function() {
        it("Test whether shows of an event in a city  are inserted correctly", function (done) {
            var eventsRC = new EventsRC(redisClient);
            var cityCode = "JAIP";
            var date = new Date();
            var dateCode = DateCode(date);
            var updateShows = new Update_shows(redisClient, mongoDb);
            eventsRC.getEvents(cityCode,date).then(function(events){
                return currentEvents(redisClient,events);
            }).then(function(events){
                return events[0]
            }).then(function(event){
                return updateShows.insertAllShows(event,cityCode,date,true);
            }).then(function(results){
                var col = mongoDb.collection("test");
                var cursor = col.find();
                cursor.toArray().then(function (retrievedShows) {
                    var insertedShows = results.ops;
                    done(assert(retrievedShows.every(function (showVal) {
                        return insertedShows.some(function (insertedShowVal) {
                            return _.isEqual(insertedShowVal, showVal);
                        });
                    })));
                })
            }).catch(done);
        })

    });
    describe("updateAllShows()",function() {
        it("Test whether shows of an event in a city are updated", function(done) {
            var eventsRC = new EventsRC(redisClient);
            var cityCode = "JAIP";
            var date = new Date();
            var dateCode = DateCode(date);
            var updateShows = new Update_shows(redisClient, mongoDb);
            eventsRC.getEvents(cityCode, date).then(function (events) {
                return currentEvents(redisClient,events);
            }).then(function(events){
                return events[0]
            }).then(function(event){
                var inserts = updateShows.insertAllShows(event, cityCode, date, true);
                return inserts.then(function(){return updateShows.updateAllShows(event, cityCode, date, true)});
            }).then(function(){
                return mongoDb.collection("test").find().toArray()
            }).then(function (updatedResult) {
                updatedResult.forEach(function (updatedShow) {
                    assert((updatedShow.lastModified - new Date()) < 100);
                });
            }).then(function(){
                done();
            }).catch(done)
        });
    });

    afterEach(function(){
        mongoDb.collection("test").drop();
        mongoDb.close();
        redisClient.end();
    });
});