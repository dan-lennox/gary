'use strict';

// Set a procress title so webpack can kill and restart the app on build.
process.title = 'chatbot';


// Core dependencies.
const path = require('path');
const fs = require('fs');

// Load environment variables.
require('dotenv').config({path: path.join(__dirname, '../.env')});

// Contrib dependencies.
const express = require('express');
const builder = require('botbuilder');
const azureBot = require('botbuilder-azure');
const azure = require('azure-storage');

// Custom dependencies.
const addresses = require('./models/addresses.model');
const helpers = require('./helpers');
const cron = require('./cron');
const azureConfig = require('./config/azure');

// Define and retrieve the commandline arguments.
const args = require('yargs').argv;

// @todo: Make it so I don't need to initialise this, as with cron.
let Helpers = new helpers();

// Define Cosmos DB settings.
// @todo: Store this config elsewhere. Look up best practice.
// var documentDbOptions = {
//   host: 'https://todobot.documents.azure.com:443/',
//   masterKey: 'RmmI8Jco6IsVch2YoKNMW1TXFkdc8LIFI68ALvIxrwDUdwN6iHCGcaTG3nkIYY6kNpdw7R3mesIuK3MNzdFHWA==',
//   database: 'todobot',
//   collection: 'botdata'
// };
// var docDbClient = new azure.DocumentDbClient(documentDbOptions);
// var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);

// Define Azure Table Storage settings.


// Initialise the Azure Table Storage.
var azureTableClient = new azureBot.AzureTableClient(
  azureConfig.botTableName,
  process.env.AZURE_STORAGE_ACCOUNT,
  process.env.AZURE_STORAGE_ACCESS_KEY
);
var tableStorage = new azureBot.AzureBotStorage({gzipData: false}, azureTableClient);

// Initialise the azure entity generator for generating storable entities.
var entGen = azure.TableUtilities.entityGenerator;

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Initialise the bot using the defined bot connector and storage option.
let bot = new builder.UniversalBot(connector).set('storage', tableStorage);

// Make sure the bot knows where to look for our Botbuilder.json file which contains default message
// overrides.
bot.localePath(path.join(__dirname, './locale'));

// Setup Express Server.
let app = express();
app.listen(3000, function () {
  console.log('Todobot is listening on port 3000!');

  // Initialise cron for timed events.
  cron.jobs.start(bot);
});

// Listen for messages from users
app.post('/api/messages', connector.listen());


//@todo: Organise the dialog's below somehow. Or at least put all of them in a single 'dialogs' file to start with.

// Initialise the bot.
bot.dialog('/',
  [
    (session) => {

      console.log('did I even get to here?');

      //console.log('Address', session.message.address);

      // @todo:

      fs.writeFile("./testAddresses.txt", JSON.stringify(session.message.address), function(err) {
        if(err) {
          return console.log(err);
        }

        console.log("The file was saved!");
      });

      // // Retrieve the message address from the session.
      // let address = session.message.address;
      //
      // // Define an Azure Table entity representing the message address.
      // let entity = {
      //   PartitionKey: entGen.String('part1'),
      //   RowKey: entGen.String(address.id),
      //   messageAddress: JSON.stringify(address)
      // };
      //
      // // Save the address to the Azure Table Storage table.
      // tableService.insertEntity(addressesTableName, entity, function(error, result, response) {
      //   if (!error) {
      //     // result contains the ETag for the new entity
      //   }
      //   // @todo: need to avoid saving duplicates obviously... hopefully the rowkey stops this automatically.
      //   console.log('attempt to save address', response);
      // });

      // (Save this information somewhere that it can be accessed later, such as in a database, or session.userData)
      //session.userData.savedAddress = savedAddress;

      console.log('outside');
      if (!session.userData.profile || args.resetUser) {
        console.log('got here');
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

  //console.log('User Data: ', session.userData.settings.checkInTime);
  // @todo: The date is there, but it's a javascript date object. Need to change this to a timestamp to
  // avoid issues later.

  //if (session.message.text === "done") {
    //session.send("Great, back to the original conversation");
    //session.endDialog();
  //} else {
  session.send('Hello, I\'m the survey dialog. I\'m interrupting your conversation to ask you a question. Type "done" to resume');
  //}
});