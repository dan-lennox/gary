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
    session.beginDialog('greetings', session.userData.greetings);
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
    session.endDialog(`OK! So you\'ve got until this time tomorrow ${results.response}!`);
  }
]);