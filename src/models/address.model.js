'use strict';

const AzureConfig = require('../config/azure');
const Azure = require('azure-storage');
const Rx = require('rxjs/Rx');

module.exports = class Address {

  constructor(){
    // Initialise the Azure table storage service for interacting with tables.
    this.tableService = Azure.createTableService();
    // Initialise the Azure entity generator for generating storable entities.
    this.entGen = Azure.TableUtilities.entityGenerator;
  }

  /**
   * Save a Botbuilder message address to the appropriate Azure Table Storage table.
   *
   * @param address - A valid address retrieved from session.message.address
   */
  create(address) {
    return Rx.Observable.create((observer) => {

      // Define an Azure Table entity representing the message address.
      let entity = {
        PartitionKey: this.entGen.String(AzureConfig.addressesTablePartition),
        RowKey: this.entGen.String(String(address.user.id)),
        messageAddress: JSON.stringify(address)
      };

      // // Save the address to the Azure Table Storage table.
      this.tableService.insertOrReplaceEntity(AzureConfig.addressesTableName, entity, function(error, result, response) {
        if (error) {
          console.log('Error: ', error);
          observer.error(error);
        }
        else {
          observer.next();
          observer.complete();
        }
      });
    })
  }

  /**
   * Retrieve all stored addresses.
   */
  getAll() {
    return Rx.Observable.create((observer) => {
      // Create an empty table query.
      var query = new Azure.TableQuery();

      // Query the Addresses table for all addresses.
      this.tableService.queryEntities(AzureConfig.addressesTableName, query, null, function (error, result, response) {
        if (error) {
          console.log('Error: ', error);
          observer.error(error);
        }
        else {

          console.log(result.entries);

          // Return any addresses.
          observer.next(result.entries.map(entry => entry.messageAddress._));
          observer.complete();
        }
      });
    });
  }


  // update

  // delete

  // load
};