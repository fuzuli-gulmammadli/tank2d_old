function addDays(date, days){
    var ms = date.getTime() + (days * 86400000);
    var newDate = new Date(ms);
    return newDate;
}

var today = new Date('2020-07-22');
console.log(today);