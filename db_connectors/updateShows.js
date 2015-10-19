var showsSAS = require("../bmsScrappers/shows"); //api from Scrap All Shows
var ShowsWithEventDetails = require("./showsWithEventDetails");
var Promise = require("bluebird");
var _ = require("underscore");

module.exports = function(redisClient,mongoDb){
    if (!mongoDb) {
        throw Error("Mongo Data Base Not Specified");
    }
    if (!redisClient) {
        throw Error("Redis Client Not Specified");
    }
    this.insertAllShows =  function(eventCode,cityCode,date,debug) {
        var collection = debug ? "test" : "bms";
        return showsSAS(cityCode,eventCode,date).then(function(shows) {
            return ShowsWithEventDetails(redisClient,shows,eventCode);
        }).then(function(showsWithEventDetails){
            if(showsWithEventDetails.length==0) return 0;
            else if(showsWithEventDetails.length==1) return mongoDb.collection(collection).insert(showsWithEventDetails);
            else return mongoDb.collection(collection).insertMany(showsWithEventDetails);
        });
    };

    this.updateAllShows =  function(eventCode,cityCode,date,debug) {
        var collection = debug ? "test" : "bms";
        return showsSAS(cityCode, eventCode, date).then(function(shows){
            return shows;
        }).map(function (show) {
            return mongoDb.collection(collection)
                .update(_.pick(show,"showId","eventCode","city"), {$currentDate: {lastModified: true}, $set: {tickets: show.tickets}});

        })
    };
};