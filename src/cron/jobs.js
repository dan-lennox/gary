'use strict';

var cron = require('node-cron');
var processDailyTasks = require('./processDailyTasks.js')

module.exports = {

  start(bot) {
    console.log('called start');
    cron.schedule('* * * * *', function() {

      // Run the process daily tasks job.
      processDailyTasks(bot);
    });
  }
}

