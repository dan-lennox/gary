// session.userdata
// Wrapper class for manipulating the userData object stored
// on the bot session in a consistent way.
const Day = require('./day.model');
const moment = require('moment');
const addressModel = require('./address.model');
const AzureConfig = require('../config/azure');
const Azure = require('azure-storage');
const Rx = require('rxjs/Rx');

module.exports = class User {

  constructor(user){
    this._user = user;
    if (!this._user.profile) {
      this._user.profile = {};
    }

    if (!this._user.settings) {
      this._user.settings = {};
    }

    if (!this._user.countries) {
      this._user.countries = [];
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

  getCountries() {
    return this._user.countries;
  }

  setCountries(countries) {
    this._user.countries = countries;
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

  // WARNING: INCOMPLETE! For debug usage only. Do not use on production data.
  delete() {
    return Rx.Observable.create((observer) => {

      // Initialise the Azure table storage service for interacting with tables.
      let tableService = Azure.createTableService();

      // Create an empty table query.
      let query = new Azure.TableQuery();

      // Query the Bot storage table for all addresses.
      // tableService.queryEntities(AzureConfig.botTableName, query, null, function (error, result, response) {
      //   if (error) {
      //     console.log('Error: ', error);
      //     observer.error(error);
      //   }
      //   else {
      //
      //     console.log(result.entries);
      //
      //     // Return any addresses.
      //     observer.next(result.entries);
      //     observer.complete();
      //   }
      // });

      let entityDescriptor = { PartitionKey: {_: this._user.platform.id, $: 'Edm.String'},
        RowKey: {_: 'userData', $: 'Edm.String'},
      };

      // Delete an address with the given User ID.
      tableService.deleteEntity(AzureConfig.botTableName, entityDescriptor, (error, response) => {
        if (error) {
          console.log('Error: ', error);
          observer.error(error);
        }
        else {

          // At this point the table row with partition key 'default-user' and
          // RowKey 'userData' should have been deleted.
          // However additional data is stored with ROWKEY: default-user and
          // PARTITIONKEY: some arbitrary key, eg. cb2c30ajbfm6', which will be different
          // each time the table is recreated.
          // @TODO: Find a REAL way to delete a user, withotu requiring prior knowledge of this
          // key...
          // @todo: Perhaps simply noting and storing this partition key for the prod environment
          // in the azure config is enough?

          let entityDescriptor = { PartitionKey: {_: 'cb2c30ajbfm6', $: 'Edm.String'},
            RowKey: {_: this._user.platform.id, $: 'Edm.String'},
          };

          // Delete an address with the given User ID.
          tableService.deleteEntity(AzureConfig.botTableName, entityDescriptor, (error, response) => {
            if (error) {
              console.log('Error: ', error);
              observer.error(error);
            }
            else {

              // We should also really delete this user's Message Address table entry.
              let Address = new addressModel();
              Address.delete('default-user').subscribe(
                (result) => {
                  console.log(result);

                  let msg = '---------------------- User bot storage deleted ----------------------';
                  observer.next(msg);
                  observer.complete(msg);
                },
                (error) => {
                  console.log('error deleting address', error);
                  observer.error(error);
                }
              );
            }
          });
        }
      });
    });
  }
};