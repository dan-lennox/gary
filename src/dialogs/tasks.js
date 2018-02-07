const User = require('../models/user.model');

module.exports = (bot, builder) => {

  // bot.dialog('yesterday', [

  bot.dialog('today', [
    (session) => {
      builder.Prompts.text(session, 'Hi! What is the absolute most important thing you need to do today?');
    },
    (session, results) => {

      // Store the task in the UserData session storage.
      let taskName = results.response;

      // @todo: fill in { this time }.
      console.log('user data', session.userData);
      let user = new User(session.userData);

      console.log('user name: ', user.getName());

      session.endDialog(`OK! So you\'ve got until this time tomorrow to complete the following: \n ${taskName}!`);
    }

    // @todo: At this point, if the user says anything, we just remind them of the task
    // they need to do by tomorrow.
  ]);

  /**
   * Attempt to process the user's daily task.
   */
  bot.dialog('processDailyTasks', (session, args, next) => {

    let user = new User(session.userData);
    let checkInTime = user.getCheckInTime();

    if (checkInTime) {

      // Retrieve the check in date from the userData store.
      let checkInDate = new Date(checkInTime * 1000);

      // Convert this to a checkin time (cull the non-time portions of the stored date).
      let time = new Date();
      time.setHours(checkInDate.getHours(), checkInDate.getMinutes(), 0);

      // Declare a Date object to represent the current time.
      let currentTime = new Date();

      // Debug.
      console.log('checkintime', time);
      console.log('now', currentTime);

      // Pro-actively message the user if the check-in time has passed.
      // @todo: This will work! But it won't do it just once a day, it will do it every time cron
      // runs (currently once per min) after the checkInTime has passed.
      // Do we then need to store a flag?
      //
      // We should store more than that...
      // A user's previous data is interesting. Could be used for a dashboard layout etc.
      //
      // let test = {
      //   days: [
      //     {
      //       date: '12345678', // Don't store the time. Just granularity of day.
      //       checked: false,
      //       tasks: [
      //         {
      //           task: 'Do my homework!',
      //           completed: false
      //         }
      //       ]
      //     }
      //   ]
      // };

      if (time < currentTime) { // && yesterday.checked = false
        console.log('user data', session.userData);
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