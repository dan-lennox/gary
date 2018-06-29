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
const facebook = require('botbuilder-facebookextension');

// Custom dependencies.
const cron = require('./cron');

// Configuration,
const azureConfig = require('./config/azure');

// Initialise the Azure Table Storage.
var azureTableClient = new azureBot.AzureTableClient(
  azureConfig.botTableName,
  process.env.AZURE_STORAGE_ACCOUNT,
  process.env.AZURE_STORAGE_ACCESS_KEY
);
var tableStorage = new azureBot.AzureBotStorage({gzipData: false}, azureTableClient);

// Create chat connector for communicating with the Bot Framework Service
let connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Initialise the bot using the defined bot connector and storage option.
let bot = new builder.UniversalBot(connector).set('storage', tableStorage);

if (process.env.FACEBOOK_PAGE_ACCESS_TOKEN) {
  bot.use(
    facebook.RetrieveUserProfile({
      accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      fields: ['locale', 'timezone'] // OPTIONAL
    })
  );
}

// Make sure the bot knows where to look for our Botbuilder.json file which contains default message
// overrides.
bot.localePath(path.join(__dirname, './locale'));

// Setup Express Server.
let app = express();

// Use dynamic port binding.
const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  // Initialise cron for timed events.
  // @todo: Fix sending of bot here, use require('cron')(bot) instead. So that all cron jobs
  // already have access to the bot.
  cron.jobs.start(bot);
});

// Listen for messages from users
app.post('/api/messages', connector.listen());

// Import dialogs.
require('./dialogs/initial')(bot, builder);
require('./dialogs/welcome')(bot, builder);
require('./dialogs/setup')(bot, builder);
require('./dialogs/tasks')(bot, builder);