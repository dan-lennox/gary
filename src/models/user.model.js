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

  getUser() {
    return this._user;
  }

  addDay(day) {
    this._user.days.push(day.getDay());
  }

  getMostRecentDay() {
    return (this._user.days.length > 0) ? new Day(this._user.days[this._user.days.length - 1]) : null;
  }
};