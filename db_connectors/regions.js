var Promise = require("bluebird");
var regionSAS = require("../bmsScrappers/regions"); //region Scrap All Shows
var regionsAlternate = require("../bmsScrappers/regionsAlternate");
var util = require("util");

module.exports = function(redisClient) {
    if (!redisClient) {
        throw Error("Redis Client Not Specified");
    }
    this.getAllRegionCodes = function() {
        var self = this;
        redisClient.existsAsync("region:codes")
        .catch(function(){
            console.log("I was called in catch block of getAll");
            self.populateRegions(redisClient);
        });
        return redisClient.smembersAsync("region:codes")
    };
    //adds a set with region:codes
    //for each city adds region:<CITY_CODE>
    this.populateRegions = function() {
        return regionsAlternate(redisClient).then(function(regions) {
            var regionCodes = Object.keys(regions);
            var allKeys = Promise.map(regionCodes,function(key){
                return redisClient.setAsync(util.format("region:%s",key),JSON.stringify(regions[key]));
            }).catch();
            var codes = redisClient.saddAsync("region:codes",regionCodes);
            return new Promise.join(allKeys,codes)
            .then(function(allKeys,codesOk){
                return regionCodes;
            })
        });
    };
    this.getCityDetails = function(cityCode) {
        var self = this;
        var key = util.format("region:%s", cityCode);
        redisClient.existsAsync(key)
        .catch(function(){
            self.populateRegions(redisClient)
        });
        return redisClient.getAsync(key).then(function(cityDetail){
            return JSON.parse(cityDetail);
        });
    };
    this.checkCityCode = function(cityCode) {
        return redisClient.existsAsync(util.format("region:%s", cityCode));
    }
};

