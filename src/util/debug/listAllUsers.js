const Azure = require('azure-storage');
const azureConfig = require('../../config/azure');

module.exports = bot => {

  let tableService = Azure.createTableService();

  // Generate an Azure table query to search for Message Address table data for the given userId.
  var query = new Azure.TableQuery()
    .top(100)
    .where('PartitionKey eq ?', 'part1');

  // Execute the query.
  tableService.queryEntities(azureConfig.addressesTableName, query, null, (error, result, response) => {

    if (error) {
      console.log(error);
      return;
    }

    if (result.entries.length === 0) {
      console.log("No user's found.");
      return;
    }

    console.log('\nDEBUG: List of all Bot users:------------------------------------------------------------------\n');
    console.log(result.entries);
    console.log('\n');
    console.log('END DEBUG ---------------------------------------------------------------------------------------\n');
  });
};