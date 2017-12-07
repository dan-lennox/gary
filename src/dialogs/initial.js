'use strict';

// Define and retrieve the commandline arguments.
const args = require('yargs').argv;

// Import the address model for interacting with stored message addresses.
const addressModel = require('../models/address.model');

module.exports = (bot, builder) => {

  /**
   * Initial Dialog.
   */
  bot.dialog('/',
    [
      (session) => {

        if (!session.userData.profile || args.resetUser) {;
          // Initialise an empty user profile object if one does not yet exist for the current user.
          session.userData.profile = {};
        }

        if (!session.userData.settings || args.resetUser) {
          // Initialise an empty user settings object if one does not yet exist for the current user.
          session.userData.settings = {};
        }

        let address = new addressModel();

        address.create(session.message.address).subscribe(
          () => {

            // Begin the Welcome dialog.
            session.beginDialog('welcome');
          },
          (error) => {
            console.log('error creating address', error);
          }
        );
      },
      (session) => {

        // Begin the Setup dialog.
        session.beginDialog('setup');
      }
    ]);
};