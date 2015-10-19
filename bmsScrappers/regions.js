var httpGet=require("../network_scheduler/httpGet");

region = function(){
    return httpGet("http://in.bookmyshow.com/getJSData/?cmd=GETREGIONS").then(function(regionsString){
        return _manipulateRegions(regionsString);
    });
};

var _manipulateRegions = function(regionsString) {
    eval(regionsString);
    var regions = {};
    var states = Object.keys(regionlst);
    states.map(function(state){
        var citiesInState = regionlst[state];
        citiesInState.map(function(city){
            regions[city.code] = {
                name : city.name,
                state: state
            };
        });
    });
    return regions;
};

module.exports = region
