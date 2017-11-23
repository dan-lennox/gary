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

let Helpers = new helpers();

// Setup Express Server.
let app = express();
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
app.post('/api/messages', connector.listen());

// Initialise the bot.
let bot = new builder.UniversalBot(connector,
  [
    (session) => {

      if (!session.userData.profile) {
        // Initialise an empty user profile if one does not yet exist for the current user.
        session.userData.profile = {};
      }
      else if (args.resetUser) {
        // Clear any existing user data for testing purposes if the --resetData argument is present.
        session.userData.profile = {};
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
    builder.Prompts.confirm(session, 'Hey there! I\'m Gary, my name is just a placeholder I\'m not all that smart yet. My job is to make sure you complete your most important task everyday! Are you ready to get started?');
    console.log('got here!!');
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
    builder.Prompts.text(session, 'Awesome! What is your name?');
  },
  (session, results) => {
    session.dialogData.name = results.response;
    builder.Prompts.time(session, `Hey ${session.dialogData.name}! What time would you like me to check in on you each day? eg, 6pm`);
    // @todo: Need validation to ensure it's just a time, not a full date.
    // @todo: NLP to check for o'clock, 6 (is it am or pm?) etc etc.
    // @todo: store time in userData ("userData stores information globally for the user across all conversations")
  },
  (session, results) => {
    session.dialogData.checkinTime = builder.EntityRecognizer.resolveTime([results.response]);

    // @todo: test the localisation when you've added the notification. Make sure it arrives at the right time.
    session.endDialog(`${Helpers.formatAMPM(session.dialogData.checkinTime)} it is! You better have it done by then or I'm taking away your streak! And that's it for setup, I'll be checking in on you tomorrow buddy!`);
  }
]);

// @todo: Push the "did you do it message" at the correct time.

// bot.dialog('setup
// -- At this point, just
// -- What is your name?
// -- What time would you like to me to check in on you?

// bot.dialog('yesterDay', [

bot.dialog('newDay', [
  (session) => {
    builder.Prompts.text(session, 'Hi! What is the absolute most important thing you need to do today?');
  },
  (session, results) => {
    session.endDialog(`OK! So you\'ve got until this time tomorrow to complete the following: \n ${results.response}!`);
  }
]);