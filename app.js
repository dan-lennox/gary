/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var azure = require('azure-storage');
var botbuilder_azure = require("botbuilder-azure");

// Core dependencies.
const path = require('path');

// Custom dependencies.
const cron = require('./src/cron');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);

  // Initialise cron for timed events.
  // @todo: Fix sending of bot here, use require('cron')(bot) instead. So that all cron jobs
  // already have access to the bot.
  cron.jobs.start(bot);
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

console.log(process.env['AzureWebJobsStorage']);

var tableName = 'botdata';
//var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);

var azureTableClient = new botbuilder_azure.AzureTableClient(
  tableName,
  process.env['AZURE_STORAGE_ACCOUNT'],
  process.env['AZURE_STORAGE_ACCESS_KEY']
);

var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

// Make sure the bot knows where to look for our Botbuilder.json file which contains default message
// overrides.
bot.localePath(path.join(__dirname, './src/locale'));

//---------------------------------------

// Import dialogs.
//@todo: Turn this into require('./dialogs)(bot, builder);
require('./src/dialogs/initial')(bot, builder);
require('./src/dialogs/welcome')(bot, builder);
require('./src/dialogs/setup')(bot, builder);
require('./src/dialogs/tasks')(bot, builder);




// Intercept trigger event (ActivityTypes.Trigger)
// bot.on('trigger', function (message) {
//     // handle message from trigger function
//     var queuedMessage = message.value;
//     var reply = new builder.Message()
//         .address(queuedMessage.address)
//         .text('This is coming from the trigger mate: ' + queuedMessage.text);
//     bot.send(reply);
// });
//
// // Handle message from user
// bot.dialog('/', function (session) {
//     var queuedMessage = { address: session.message.address, text: session.message.text };
//     // add message to queue
//     session.sendTyping();
//     var queueSvc = azure.createQueueService(process.env.AzureWebJobsStorage);
//     queueSvc.createQueueIfNotExists('bot-queue', function(err, result, response){
//         if(!err){
//             // Add the message to the queue
//             var queueMessageBuffer = new Buffer(JSON.stringify(queuedMessage)).toString('base64');
//             queueSvc.createMessage('bot-queue', queueMessageBuffer, function(err, result, response){
//                 if(!err){
//                     // Message inserted
//                     session.send('Your message (\'' + session.message.text + '\') has been added to a queue, and it will be sent back to you via a Function');
//                 } else {
//                     // this should be a log for the dev, not a message to the user
//                     session.send('There was an error inserting your message into queue');
//                 }
//             });
//         } else {
//             // this should be a log for the dev, not a message to the user
//             session.send('There was an error creating your queue');
//         }
//     });
//
// });