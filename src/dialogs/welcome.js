'use strict';

module.exports = (bot, builder) => {

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
};