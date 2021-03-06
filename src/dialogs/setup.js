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
        builder.Prompts.text(session, 'Excellent. What is your name?');
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

        builder.Prompts.time(session, `Greetings supreme leader ${user.getName()}. By what time should your most important task be completed each day? eg, 6pm`);
        // @todo: Need validation to ensure it's just a time, not a full date.
        // @todo: NLP to check for o'clock, 6 (is it am or pm?) etc etc.
        // @todo: store time in userData ("userData stores information globally for the user across all conversations")
      }
    },
    (session, results) => {
      let user = new User(session.userData);

      // Retrieve the checkin time inputed by the user (Let the botbuilder convert the response to
      // a javascript date object).
      let time = builder.EntityRecognizer.resolveTime([results.response]);

      // Save the check in time.
      user.setCheckInTime(time);

      console.log('User Data', session.userData);

      // If a timezone hasn't been set by any middleware, such as botbuilder-facebookextension
      // then check to see if a 'localTimestamp' was attached to the message by the channel and
      // use this to save the timezone value instead.
      if (!session.userData.timezone && session.message.localTimestamp) {
        let local = new Date(session.message.localTimestamp).getTimezoneOffset();
        session.userData.timezone = -local/60;
      }

      let displayTime = moment(time).format('h:mm a');

      // Let the user know the time is set.
      session.endDialog(`${displayTime} it is. If you can complete your task by ${displayTime} tomorrow, you'll conquer your first country and be one step closer to ruling the world!`);
      // It would be great to throw in a doctor evil gif at this point.
    }
  ]);

};