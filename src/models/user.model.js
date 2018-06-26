// session.userdata
// Wrapper class for manipulating the userData object stored
// on the bot session in a consistent way.
const Day = require('./day.model');
const moment = require('moment');

module.exports = class User {

  constructor(user){
    this._user = user;
    if (!this._user.profile) {
      this.user.profile = {};
    }

    if (!this._user.settings) {
      this._user.settings = {};
    }

    if (!this._user.days) {
      this._user.days = [];
    }
  };

  setName(name) {
    this._user.profile.name = name;
  }

  getName() {
    return this._user.profile.name;
  }

  setCheckInTime(time) {
    // Save a timestamp to the Session User Data.
    this._user.settings.checkInTime = Math.round(time.getTime()/1000);
  }

  getCheckInTime() {
    return moment(this._user.settings.checkInTime*1000).format('h:mma');
  }

  getCheckInTimestamp() {
    return this._user.settings.checkInTime;
  }

  getTimezoneOffset() {
    return this._user.timezone;
  }

  getUser() {
    return this._user;
  }

  addDay(day) {
    this._user.days.push(day.getDay());
  }

  getDays() {
    return this._user.days;
  }

  getMostRecentDay() {
    return (this._user.days.length > 0) ? new Day(this._user.days[this._user.days.length - 1]) : null;
  }

  checkInTimePassed() {

    let timeZoneOffset = this.getTimezoneOffset();

    // Retrieve the date of the most recent day.
    let checkInDate = moment(this.getMostRecentDay().getDateObject()).add(1, 'days').utcOffset(timeZoneOffset);

    // Debug (Make tomorrow into today).
    //let checkInDate = moment(this.getMostRecentDay().getDateObject()).utcOffset(timeZoneOffset);

    // Retrieve the check in time from the userData store.
    let checkInTimeAsDate = new Date(this.getCheckInTimestamp() * 1000);

    // Combine the most recent day with the general Check In Time to work out when the
    // day's task's are due.
    checkInDate.hour(checkInTimeAsDate.getHours());
    checkInDate.minute(checkInTimeAsDate.getMinutes());

    // Declare a Date object to represent the current time.
    let today = moment().utcOffset(timeZoneOffset);

    // Check debugging.
    console.log('currentTime', today);
    console.log('check in date', checkInDate);
    console.log('today is later than checkin time', (today > checkInDate));

    return (today > checkInDate);
  }

};