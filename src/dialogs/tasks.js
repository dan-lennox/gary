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

    if (session.userData.settings.checkInTime) {

      // Retrieve the check in date from the userData store.
      let checkInDate = new Date(session.userData.settings.checkInTime * 1000);

      // Convert this to a checkin time (cull the non-time portions of the stored date).
      let checkInTime = new Date();
      checkInTime.setHours(checkInDate.getHours(), checkInDate.getMinutes(), 0);

      // Declare a Date object to represent the current time.
      let currentTime = new Date();

      // Debug.
      console.log('checkintime', checkInTime);
      console.log('now', currentTime);

      // Pro-actively message the user if the check-in time has passed.
      if (checkInTime < currentTime) {
        session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
      }
    }

    session.endDialog();


    //if (session.message.text === "done") {
    //session.send("Great, back to the original conversation");
    //session.endDialog();
    //} else {
    //}
  });

};