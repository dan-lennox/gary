const User = require('../models/user.model');
const Day = require('../models/day.model');
const Task = require('../models/task.model');
const moment = require('moment');
const CountriesList = require('../models/countriesList.model');

module.exports = (bot, builder) => {

  // bot.dialog('yesterday', [

  bot.dialog('today', [
    (session) => {

      // Load the user.
      let user = new User(session.userData);

      // Load the most recent day created for this user.
      let mostRecentDay = user.getMostRecentDay();

      if (!mostRecentDay || user.checkInTimePassed()) {
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

    // Load the most recent Day.
    let mostRecentDay = user.getMostRecentDay();

    // Debug (Allow multiple checks per day).
    // mostRecentDay.setChecked(false);

    // Don't check anything if the user hasn't even set their account settings yet.
    // Don't check in with the user more than once.
    if (!checkInTime || !mostRecentDay || mostRecentDay.getChecked()) {
      session.endDialog();
    }
    // If the checkin time has passed.
    else if (user.checkInTimePassed()) {

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
      // Load the most recent Day.
      let mostRecentDay = user.getMostRecentDay();

      let currentTask = mostRecentDay.getTask();

      if (currentTask.getCompleted()) {
        if (user.checkInTimePassed()) {
          session.beginDialog('today');
        }
        else {
          let checkInTime = user.getCheckInTime();
          session.endConversation(`You have already completed your task for today. I'll check back in at ${checkInTime} for a new task.`)
        }
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


        let countries = new CountriesList();

        // Retrieve a random country that the user has not yet conquered.
        countries.getRandom(user.getCountries())
          .then((country) => {

            // Add a new country to the empire.
            let userCountries = new CountriesList(user.getCountries());
            userCountries.addCountry(country);
            userCountries.getList()
              .then((list) => {

                // Save the updated list of countries to the user.
                user.setCountries(list);

                // Let the user know about their new conquest!
                session.send(`Excellent! I'm pleased to report that ${country.Name} has fallen under our control. You empire has now grown to ${user.getCountries().length} countries`);

                // Set the current task for for yesterday as completed.
                currentTask.setCompleted();

                // Start a new day!
                session.beginDialog('today');
              });
          });
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

          // Remove a country from the empire!
          let userCountries = new CountriesList(user.getCountries());
          userCountries.removeRandom()
            .then(({country, list}) => {

              // Save the updated list of countries to the user.
              user.setCountries(list);

              // Let the user know about their recent failure!
              session.send(`This is unfortunate... I am ashamed to report that ${country.Name} successfully rebelled. Your empire now only has ${user.getCountries().length} countries.`);
              session.send('We shall try again tomorrow.');

              if (user.checkInTimePassed()) {
                session.beginDialog('today');
              }
            });
        }
      }
    }
  ]);

};