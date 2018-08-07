'use strict';

const AzureConfig = require('../config/azure');
const Azure = require('azure-storage');
const addressModel = require('../models/address.model');

module.exports = (bot) => {

  let address = new addressModel();

  address.getAll().subscribe(
    (addresses) => {


      addresses.forEach((addressJSON) => {

        let address = JSON.parse(addressJSON);

        console.log('Address to process', address);

        // Connect to the Azure TableStorage.
        let tableService = Azure.createTableService();

        // Generate an Azure table query to search for Message Address table data for the given userId.
        let query = new Azure.TableQuery()
          .where('RowKey eq ?', 'userData')
          .and('PartitionKey eq ?', address.user.id);

          // Delete an address with the given User ID.
          tableService.queryEntities(AzureConfig.botTableName, query, null, (error, result, response) => {
            if (error) {
              console.log('Error: ', error);
            }
            else {
              // @todo: Move the storage of "timezone" into Settings.
              console.log('checkinTime', response.body.value.settings.checkInTime);
              console.log('timezone', response.body.value.timezone);

              // @todo: Move the dialog logic in here to ensure only those user's who's checkin time has passed
              // will actually have their conversations interrupted.
              bot.beginDialog(address, "*:processDailyTasks");
            }
          });
      });
    },
    (error) => {}
  );
};