'use strict';

const helpers = require('../helpers');

module.exports = (bot, builder) => {

  // @todo: Make it so I don't need to initialise this, as with cron.
  let Helpers = new helpers();

  /**
   *
   */
  bot.dialog('setup', [
    (session) => {
      session.beginDialog('askForUserName');
    },
    (session) => {
      session.beginDialog('askForCheckInTime');
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

      // Store the user's name in userData so that it persists globally across all conversations.
      session.userData.profile = {
        "name": results.response
      };
      session.endDialog();
    }
  ]);

  bot.dialog('askForCheckInTime', [
    (session) => {

      if (session.userData.settings.checkInTime) {
        session.endDialog();
      }
      else {
        builder.Prompts.time(session, `Hey ${session.userData.profile.name}! What time would you like me to check in on you each day? eg, 6pm`);
        // @todo: Need validation to ensure it's just a time, not a full date.
        // @todo: NLP to check for o'clock, 6 (is it am or pm?) etc etc.
        // @todo: store time in userData ("userData stores information globally for the user across all conversations")
      }
    },
    (session, results) => {

      // Retrieve the checkin time inputed by the user (Let the botbuilder convert the response to
      // a javascript date object.
      let time = builder.EntityRecognizer.resolveTime([results.response]);

      // Save a timestamp to the Session User Data.
      session.userData.settings = {
        "checkInTime": Math.round(time.getTime()/1000)
      };

      // @todo: test the localisation when you've added the notification. Make sure it arrives at the right time.
      session.endDialog(`${Helpers.formatAMPM(time)} it is! You better have it done by then or I'm taking away your streak! And that's it for setup, I'll be checking in on you tomorrow buddy!`);
    }
  ]);

};