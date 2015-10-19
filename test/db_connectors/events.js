var assert = require('assert');
var EventsRC = require("../../db_connectors/events.js");
var redis = require("redis");
var Promise = require("bluebird");
var dateCode = require("../../helpers/dateCode");


describe("db_connectors: Events", function(){
    var redisClient;
    //delete all the keys of regions before testing each
    beforeEach(function(){
        redisClient = Promise.promisifyAll(redis.createClient());
    });

    it("populateEvents",function(done){
        this.timeout(2000000);
        var eventsRC = new EventsRC(redisClient);
        eventsRC.populateEvents().then(function(events){
            done();
        }).catch(done);
    });

    it("getEvents", function(done){
        var eventsRC = new EventsRC(redisClient);
        eventsRC.getEvents("JAIP").then(function(jaipurEvents) {
            return redisClient.smembersAsync("events:" + dateCode() + ":JAIP")
            .then(function (v) {
                assert.equal(JSON.stringify(v.sort()), JSON.stringify(jaipurEvents.sort()));
            }).then(function(){
                done();
            });
        }).catch(done);
    });

    afterEach(function(){
        redisClient.end()
    })
});