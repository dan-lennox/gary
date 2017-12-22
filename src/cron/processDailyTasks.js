'use strict';

const addressModel = require('../models/address.model');

module.exports = (bot) => {

  let address = new addressModel();

  address.getAll().subscribe(
    (addresses) => {


      addresses.forEach((address) => {
        bot.beginDialog(JSON.parse(address), "*:processDailyTasks");
      });
    },
    (error) => {}
  );
};