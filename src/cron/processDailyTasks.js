'use strict';

const addressModel = require('../models/address.model');

module.exports = (bot) => {

  let address = new addressModel();

  address.getAll().subscribe(
    (addresses) => {

      console.log('NUMBER OF DUPLICATES', addresses.length);

      addresses.forEach((address) => {
        bot.beginDialog(JSON.parse(address), "*:processDailyTasks");
      });
    },
    (error) => {}
  );
};