var httpGet=require("../network_scheduler/httpGet");
var util = require("util");
//http://in.bookmyshow.com/getJSData/?file=/data/js/GetEvents_MT.js&cmd=GETEVENTSWEB&et=MT&rc=

module.exports = function(cityCode){
    var path = util.format("http://in.bookmyshow.com/getJSData/?file=/data/js/GetVenues_MT_%s.js&" +
        "cmd=GETVENUESWEB&et=MT&rc=%s", cityCode,cityCode);
    return httpGet(path).then(function(venuesString) {
        return _manipulateVenues(venuesString);

    });
};

var _manipulateVenues = function(venuesString){
    eval(venuesString);
    return aiVN.map(function(venue){
        return {
            venueCode:venue[0],
            managementCode:venue[1],
            name:venue[2]
        }
    });
};