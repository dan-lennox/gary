'use strict';

var cron = require('node-cron');
var processDailyTasks = require('./processDailyTasks.js')

module.exports = {

  start(bot) {
    cron.schedule('* * * * *', () => {

      // Run the process daily tasks job.
      processDailyTasks(bot);
    });
  }
};

