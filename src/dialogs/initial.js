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

        if (!session.userData.platform || args.resetUser) {
          session.userData.platform = {
            'name': session.message.source,
            'id': session.message.user.id
          }
        }

        if (!session.userData.profile || args.resetUser) {;
          // Initialise an empty user profile object if one does not yet exist for the current user.
          session.userData.profile = {};
        }

        if (!session.userData.countries || args.resetUser) {;
          // Initialise an empty user countries array if one does not yet exist for the current user.
          session.userData.countries = [];

          // Debug a user with existing countries.
          // session.userData.countries = [
          //   {"Code": "AL", "Name": "Albania"},
          //   {"Code": "DZ", "Name": "Algeria"}
          // ];
        }

        if (!session.userData.settings || args.resetUser) {
          // Initialise an empty user settings object if one does not yet exist for the current user.
          session.userData.settings = {};
        }

        console.log('session in initial dialog', session);

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