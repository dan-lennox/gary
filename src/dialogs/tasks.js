'use strict';

module.exports = (bot, builder) => {

  // bot.dialog('yesterday', [

  bot.dialog('today', [
    (session) => {
      builder.Prompts.text(session, 'Hi! What is the absolute most important thing you need to do today?');
    },
    (session, results) => {
      session.endDialog(`OK! So you\'ve got until this time tomorrow to complete the following: \n ${results.response}!`);
    }
  ]);

  /**
   * Attempt to process the user's daily task.
   */
  bot.dialog('processDailyTasks', (session, args, next) => {

    console.log('actually attempted to call this?');

    //console.log('User Data: ', session.userData.settings.checkInTime);
    // @todo: The date is there, but it's a javascript date object. Need to change this to a timestamp to
    // avoid issues later.

    //if (session.message.text === "done") {
    //session.send("Great, back to the original conversation");
    //session.endDialog();
    //} else {
    session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
    //}
  });

};