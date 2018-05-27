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

      // @todo: We also need to store the user's timezone!!
      // @todo: WORST CASE: we can convert the time to the system timezone.
      console.log('time entered', time);
      console.log('full time request response', results.response);
      console.log('entire session', session.message.localTimestamp);

      let test = new Date(session.message.localTimestamp);

      //SWITCH THE SIGNS. 300 is actually -300 (so -5 Merida).
      console.log('timezone offset', test.getTimezoneOffset());

      let displayTime = moment(time).format('h:mm a');

      // Let the user know the time is set.
      session.endDialog(`${displayTime} it is. If you can complete your task by ${displayTime} tomorrow, you'll conquer your first country and be one step closer to ruling the world!`);
      // It would be great to throw in a doctor evil gif at this point.
    }
  ]);

};