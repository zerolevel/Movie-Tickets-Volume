module.exports = function(date) {
    date = date || new Date();
    return date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + (date.getDate())).slice(-2);
};