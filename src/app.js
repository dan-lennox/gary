'use strict';

// Set a procress title so webpack can kill and restart the app on build.
process.title = 'chatbot';

//import express from 'express';
const express = require('express');
// Annoyingly, this needs to stay as require - https://github.com/Microsoft/BotBuilder/issues/2974
const builder = require('botbuilder');

const helpers = require("./helpers");

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

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
let bot = new builder.UniversalBot(connector, [
  (session) => {
    session.beginDialog('welcome', session.userData.greetings);
  },
  (session) => {
    session.beginDialog('setup', session.userData.settings);
  }
]);

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