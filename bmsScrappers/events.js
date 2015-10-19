
var httpGet=require("../network_scheduler/httpGet");

//http://in.bookmyshow.com/getJSData/?file=/data/js/GetEvents_MT.js&cmd=GETEVENTSWEB&et=MT&rc=

module.exports = function(cityCode,date){
    path = "http://in.bookmyshow.com/getJSData/?file=/data/js/GetEvents_MT.js&cmd=GETEVENTSWEB&et=MT&rc=" + cityCode;
    return httpGet(path).then(function(events) {
        return _manipulateEvents(events);
    });
};

var _manipulateEvents = function(eventsString){
    eval(eventsString);
    return aiEV.map(function(event){
        return {
            id: event[1],
            movieName: event[4],
            releaseDate: event[7]
        }
    });

};