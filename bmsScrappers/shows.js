var httpGet=require("../network_scheduler/httpGet");
var util = require("util");
var DateCode = require("../helpers/dateCode");

module.exports = function (cityCode, eventCode, date) {
    var dateCode = DateCode(date);
    var path = util.format("http://in.bookmyshow.com/getJSData/?file=/data/js/GetShowTimesByEvent.js" +
        "&cmd=GETSHOWTIMESBYEVENTWEB&ec=%s&dc=%s&rc=%s", eventCode, dateCode, cityCode);
    return httpGet(path)
        .then(function(showsDetail){
        return _manipulateShowTimes(showsDetail,cityCode,eventCode,dateCode);
    });
};

//based on how data is arranged in the returned response of private bms API
//returns shows
function _manipulateShowTimes(showsDetail,cityCode,eventCode,dateCode) {
    eval(showsDetail); //gets three arrays aST (showTimes), aVN(venues) and aAV(ticket prices & occupancy details)
    var eventDetails = {};
    var showTimes = {};
    aST.map(function(stArray){
        showTimes[stArray[2]] = stArray[3];
    });
    var venues = {};
    aVN.map(function(value){
        venues[value[0]] = value[1];
    });
    var shows = {};
    aAV.map(function(value){
        if(!shows[value[1]]) {
            shows[value[1]] = {
                venue: venues[value[0]],
                venueId: value[0],
                showId: value[1],
                tickets: [],
                city: cityCode,
                eventCode:eventCode,
                showTime:showTimes[value[1]],
                dateCode:dateCode
            }
        }
        shows[value[1]].tickets.push({
            classCode: value[2],
            class: value[3],
            price: value[4],
            totalSeats: value[6],
            seatsSold: value[6] - value[5]
        })
    });
    return Object.keys(shows).map(function(showKey){
        return shows[showKey];
    });
}