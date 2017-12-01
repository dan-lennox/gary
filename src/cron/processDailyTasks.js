'use strict';

const fs = require('fs');

module.exports = (bot) => {

  // NOTES ON BOT STATE STORAGE:
  // https://docs.microsoft.com/en-us/bot-framework/troubleshoot-general-problems
  // While I'm using the emulator, the data only exists while the emulator is running.
  // The real implementation on Azure should store more permanently.

  // With the test bot... we can only load one address anyway. So let's load this one static one from
  // a file.

  let address;

  fs.readFile('./testAddresses.txt', 'utf8', (err, data) => {
    if (err) throw err;

    address = JSON.parse(data);
    bot.beginDialog(address, "*:processDailyTasks");
  });



  //console.log('the bot is', bot);


};