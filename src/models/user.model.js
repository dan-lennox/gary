// session.userdata
// Wrapper class for manipulating the userData object stored
// on the bot session in a consistent way.

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

  setCheckInTime() {

  }

  getCheckInTime() {
    return this._user.settings.checkInTime;
  }

  getUser() {
    return this._user;
  }

  // save(session) {
  //   session.userData = this._user;
  // }

};