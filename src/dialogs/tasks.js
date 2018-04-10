const User = require('../models/user.model');
const Day = require('../models/day.model');
const Task = require('../models/task.model');

module.exports = (bot, builder) => {

  // bot.dialog('yesterday', [

  bot.dialog('today', [
    (session) => {

      // Load the user.
      let user = new User(session.userData);

      // Load the most recent day created for this user.
      let mostRecentDay = user.getMostRecentDay();

      if (!mostRecentDay || new Date() > mostRecentDay.getDate()) {
        // If the user hasn't set a task for today or if this is their first time using the bot.
        builder.Prompts.text(session, 'What is the absolute MOST IMPORTANT thing you need to do today?');
      }
      else {

        // @todo: FUN - See if the Microsoft bot service can handle any random
        // strings here, like greetings etc. If it can't, then default to "You already have a task".

        // Otherwise a task has already been set.
        // @todo: At this point, if the user says anything, we just remind them of the task
        // they need to do by tomorrow.
        // session.endDialog(`You committed to getting ${taskName} done by ${time}`);
        //session.endDialog(`You already have a task today.`);
        // @todo: Add 'Would you like to change your task for today?'.
        session.beginDialog('checkIn');
      }
    },
    (session, results) => {

      // Store the task name provided by the user.
      let taskName = results.response;

      // Load the user.
      let user = new User(session.userData);

      // Initialise a new 'Day'.
      let tomorrow = new Day();

      let checkInTime = user.getCheckInTime();

      // Add the task to the day.
      tomorrow.addTask(taskName);

      // Add the day to the user.
      user.addDay(tomorrow);

      session.endDialog(`Excellent choice supreme leader ${user.getName()}. You have until ${checkInTime} tomorrow to complete the following: \n "${taskName}".`);
    }
  ]);

  /**
   * Attempt to process the user's daily task.
   */
  bot.dialog('processDailyTasks', (session, args, next) => {

    let user = new User(session.userData);
    let checkInTime = user.getCheckInTimestamp();

    // Don't check anything if the user hasn't even set their account settings yet.
    if (!checkInTime) {
      session.endDialog();
      return;
    }

    // Load the most recent Day.
    let mostRecentDay = user.getMostRecentDay();

    // Debug.
    //mostRecentDay.setChecked(false);

    // Don't check in with the user more than once.
    if (!mostRecentDay || mostRecentDay.getChecked()) {
      session.endDialog();
      return;
    }

    // Retrieve the check in date from the userData store.
    let checkInTimeAsDate = new Date(checkInTime * 1000);

    // Retrieve the date of the most recent dat.
    let checkInDate = mostRecentDay.getDate();

    // Combine the most recent day with the check in time to work out when the
    // day's task's are due.
    checkInDate.setHours(checkInTimeAsDate.getHours(), checkInTimeAsDate.getMinutes(), 0);

    // Declare a Date object to represent the current time.
    let currentTime = new Date();

    // If the checkin time has passed.
    // Debug.
    //if (currentTime < checkInDate) {
    if (currentTime > checkInDate) {

      // Record that the user's task for this day was checked.
      // We only want to prompt them once via cron to see if they have completed their task.
      mostRecentDay.setChecked();


      // @toto: I should be able to pass arguments here, so I don't have to reload the most
      // recent day etc.
      session.beginDialog('checkIn');
    }
    else {
      session.endDialog();
    }
  });

  bot.dialog('checkIn', [
    (session) => {
      //debugger;
      let user = new User(session.userData);

      // Load the most recent Day.
      let mostRecentDay = user.getMostRecentDay();

      let currentTask = mostRecentDay.getTask();

      if (currentTask.getCompleted()) {
        let checkInTime = user.getCheckInTime();
        session.endConversation(`You have already completed your task for today. I'll check back in at ${checkInTime} for a new task.`)
      }
      else {
        builder.Prompts.confirm(session, `Greetings supreme leader ${user.getName()}. Your most import task yesterday was: "${currentTask.getName()}". Have you completed it yet?`);
      }
    },
    (session, results) => {
      if (results.response) {


        let user = new User(session.userData);
        let mostRecentDay = user.getMostRecentDay();
        let currentTask = mostRecentDay.getTask();

        session.send("Excellent! I'm pleased to report that Thailand has fallen under our control. You empire has now grown to 24 countries");
        console.log('before', currentTask);
        currentTask.setCompleted();
        console.log('after', currentTask);
        console.log('session after', session.userData);
        session.beginDialog('today');
      }
      else {

        // Load the most recent Day.
        let user = new User(session.userData);
        let mostRecentDay = user.getMostRecentDay();

        // If this 'checkIn' was simply from user interaction, not from the 'end of day Check In'.
        if (!mostRecentDay.getChecked()) {
          session.endConversation("OK I'll leave you alone to continue your procrastinating ways.")
        }
        else {

          // Else, this was the 'end of day' checkIn,
          // - You should have done your task!!
          // - Go to "new day" dialog flow.
          session.send('Unfortunate... I am ashamed to report that Lithuania successfully rebelled. Your empire now only has 23 countries.');
          session.send('We shall try again tomorrow.');
          session.beginDialog('today');
        }
      }
    }
  ]);

};