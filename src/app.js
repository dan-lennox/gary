'use strict';

// Set a procress title so webpack can kill and restart the app on build.
process.title = 'chatbot';

// Define and retrieve the commandline arguments.
const args = require('yargs').argv;

//import express from 'express';
const express = require('express');
// Annoyingly, this needs to stay as require - https://github.com/Microsoft/BotBuilder/issues/2974
const builder = require('botbuilder');

const helpers = require('./helpers');

const path = require('path');

const cron = require('./cron');

const fs = require('fs');

let Helpers = new helpers();

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

let bot = new builder.UniversalBot(connector);

// Setup Express Server.
let app = express();
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');

  cron.jobs.start(bot);
});

// Listen for messages from users
app.post('/api/messages', connector.listen());

// Initialise the bot.
bot.dialog('/',
  [
    (session) => {

      console.log('Address', session.message.address);

      //let savedAddress = session.message.address;

      //console.log('bot connector', connector);

      fs.writeFile("./testAddresses.txt", JSON.stringify(session.message.address), function(err) {
        if(err) {
          return console.log(err);
        }

        console.log("The file was saved!");
      });

      // (Save this information somewhere that it can be accessed later, such as in a database, or session.userData)
      //session.userData.savedAddress = savedAddress;

      if (!session.userData.profile || args.resetUser) {
        // Initialise an empty user profile object if one does not yet exist for the current user.
        session.userData.profile = {};
      }

      if (!session.userData.settings || args.resetUser) {
        // Initialise an empty user settings object if one does not yet exist for the current user.
        session.userData.settings = {};
      }

      // Begin the Welcome dialog.
      session.beginDialog('welcome');
    },
    (session) => {

      // Begin the Setup dialog.
      session.beginDialog('setup');
    }
]);

// Make sure the bot knows where to look for our Botbuilder.json file which contains default message
// overrides.
bot.localePath(path.join(__dirname, './locale'));

/**
 * Welcome dialog
 */
bot.dialog('welcome', [
  (session) => {

    if (!session.userData.profile.name) {
      builder.Prompts.confirm(session, 'Hey there! I\'m Gary, my name is just a placeholder I\'m not all that smart yet. My job is to make sure you complete your most important task everyday! Are you ready to get started?');
    }
    else {
      session.endDialog();
    }
  },
  (session, results) => {
    if (results.response) {
      session.endDialog();
    }
    else {
      session.endConversation("OK I'll leave you alone to continue your procrastinating ways.")
    }
  },
]);

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

  console.log('User Data: ', session.userData.settings.checkInTime);
  // @todo: The date is there, but it's a javascript date object. Need to change this to a timestamp to
  // avoid issues later.

  //if (session.message.text === "done") {
    //session.send("Great, back to the original conversation");
    //session.endDialog();
  //} else {
  session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
  //}
});