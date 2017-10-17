// @todo: Setup gulp, webpack and babel.
// @todo: restart the app on file changes (watch).s


const express = require('express');
var builder = require('botbuilder');

// Setup Express Server.
var app = express();
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users
app.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
 //session.send("You said: %s", session.message.text);
  function (session) {
    session.beginDialog('welcome', session.userData.greetings);
  },
  function (session) {
    session.beginDialog('setup', session.userData.settings);
  }
]);

bot.dialog('welcome', [
  function (session) {
    builder.Prompts.confirm(session, 'Hey there! I\'m Gary, my name is just a placeholder I\'m not all that smart yet. My job is to make sure you complete your most important task everyday! Are you ready to get started?');
  },
  function (session, results) {

    if (results.response) {
      session.endDialog();
    }
    else {
      session.endConversation("OK I'll leave you alone to continue your procrastinating ways.")
    }
  },
]);

bot.dialog('setup', [
  function (session) {
    builder.Prompts.text(session, 'Awesome! What is your name?');
  },
  function (session, results) {
    session.dialogData.name = results.response;
    builder.Prompts.time(session, `Hey ${session.dialogData.name}! What time would you like me to check in on you each day? eg, 6pm`);
    // @todo: Need validation to ensure it's just a time, not a full date.
    // @todo: NLP to check for o'clock, 6 (is it am or pm?) etc etc.
    // @todo: store time in userData ("userData stores information globally for the user across all conversations")
  },
  function (session, results) {
    session.dialogData.checkinTime = builder.EntityRecognizer.resolveTime([results.response]);
    session.endDialog(`${session.dialogData.checkinTime} it is! You better have it done by then or I'm taking away your streak! And that's it for setup, I'll be checking in on you tomorrow buddy!`);
  }
]);

// bot.dialog('setup
// -- At this point, just
// -- What is your name?
// -- What time would you like to me to check in on you?

// bot.dialog('yesterDay', [

bot.dialog('newDay', [
  function (session) {
    builder.Prompts.text(session, 'Hi! What is the absolute most important thing you need to do today?');
  },
  function (session, results) {
    session.endDialog(`OK! So you\'ve got until this time tomorrow to complete the following: \n ${results.response}!`);
  }
]);