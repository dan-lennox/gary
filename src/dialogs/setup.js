'use strict';

const User = require('../models/user.model');
const moment = require('moment');

module.exports = (bot, builder) => {

  /**
   *
   */
  bot.dialog('setup', [
    (session) => {
      session.beginDialog('askForUserName');
    },
    (session) => {
      session.beginDialog('askForCheckInTime');
    },
    (session) => {
      session.beginDialog('today');
    }
  ]);

  bot.dialog('askForUserName', [
    (session) => {

      if (session.userData.profile.name) {
        session.endDialog();
      }
      else {
        builder.Prompts.text(session, 'Awesome! What is your name?');
      }
    },
    (session, results) => {

      let user = new User(session.userData);
      user.setName(results.response);

      session.endDialog();
    }
  ]);

  bot.dialog('askForCheckInTime', [
    (session) => {

      if (session.userData.settings.checkInTime) {
        session.endDialog();
      }
      else {
        let user = new User(session.userData);

        builder.Prompts.time(session, `Hey ${user.getName()}! What time would you like me to check in on you each day? eg, 6pm`);
        // @todo: Need validation to ensure it's just a time, not a full date.
        // @todo: NLP to check for o'clock, 6 (is it am or pm?) etc etc.
        // @todo: store time in userData ("userData stores information globally for the user across all conversations")
      }
    },
    (session, results) => {
      let user = new User(session.userData);

      // Retrieve the checkin time inputed by the user (Let the botbuilder convert the response to
      // a javascript date object.
      let time = builder.EntityRecognizer.resolveTime([results.response]);
      // Save the check in time.
      user.setCheckInTime(time);

      // Let the user know the time is set.
      // @todo: Replace helper function with moment js.
      session.endDialog(`${moment(time).format('h:mm a')} it is! You better have it done by then or I'm taking away your streak! And that's it for setup, I'll be checking in on you tomorrow buddy!`);
    }
  ]);

};