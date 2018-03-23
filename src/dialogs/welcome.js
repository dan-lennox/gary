'use strict';

module.exports = (bot, builder) => {

  /**
   * Welcome dialog
   */
  bot.dialog('welcome', [
    (session) => {

      if (!session.userData.profile.name) {
        builder.Prompts.confirm(session, `Greetings future dictator! In theory, if you complete your single MOST IMPORTANT task every single day, it should be a relatively trivial task to conquer and rule this weak and unfocussed planet! I will be your assistant in this matter. Are you ready to conquer your first nation?`);
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