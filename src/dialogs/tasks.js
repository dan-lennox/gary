const User = require('../models/user.model');
const Day = require('../models/day.model');
const Task = require('../models/task.model');
const moment = require('moment');

module.exports = (bot, builder) => {

  // bot.dialog('yesterday', [

  bot.dialog('today', [
    (session) => {

      // Load the user.
      let user = new User(session.userData);

      // Load the most recent day created for this user.
      let mostRecentDay = user.getMostRecentDay();

      let today = new Date();

      if (!mostRecentDay || (today.getDate() > mostRecentDay.getDateObject().getDate())) {
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
      let today = new Day();

      let checkInTime = user.getCheckInTime();

      // Add the task to the day.
      today.addTask(taskName);

      // Add the day to the user.
      user.addDay(today);

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
    }

    // Load the most recent Day.
    let mostRecentDay = user.getMostRecentDay();

    // Debug.
    // mostRecentDay.setChecked(false);

    // Don't check in with the user more than once.
    if (!mostRecentDay || mostRecentDay.getChecked()) {
      session.endDialog();
    }

    // Retrieve the date of the most recent day.
    let checkInDate = moment(mostRecentDay.getDateObject()).add(1, 'days').utcOffset(user.getTimezoneOffset());

    // Retrieve the check in time from the userData store.
    let checkInTimeAsDate = new Date(checkInTime * 1000);

    // Combine the most recent day with the general Check In Time to work out when the
    // day's task's are due.
    checkInDate.hour(checkInTimeAsDate.getHours());
    checkInDate.minute(checkInTimeAsDate.getMinutes());

    // Declare a Date object to represent the current time.
    let today = moment().utcOffset(user.getTimezoneOffset());

    // Check debugging.
    console.log('currentTime', today);
    console.log('check in date', checkInDate);
    console.log('today is later than checkin time', (today > checkInDate));

    // If the checkin time has passed.
    if (today > checkInDate) {

      // Record that the user's task for this day was checked.
      // We only want to prompt them once via cron to see if they have completed their task.
      mostRecentDay.setChecked();

      // If the user already marked their task as completed (without waiting until the end of
      // the day for the prompt) then, on the start of a new day, we can simply push straight
      // through to the 'today' dialog and ask for today's new task.
      if (mostRecentDay.getTask().getCompleted()) {
        // @todo: We should pass a bespoke message. Eg, Well done yesterday! What's your most important...
        session.beginDialog('today');
      }
      else {
        // @toto: I should be able to pass arguments here, so I don't have to reload the most
        // recent day etc.
        session.beginDialog('checkIn');
      }
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