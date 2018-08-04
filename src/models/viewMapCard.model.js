module.exports = (builder, session) => {

  return new builder.Message(session).addAttachment(
    new builder.HeroCard(session)
      .title("View your conquests")
      //.subtitle("Click the link below to view your conquests on a map!")
      .text("Click the link below to view your conquests on a map!")
      .images([builder.CardImage.create(session, 'https://upload.wikimedia.org/wikipedia/commons/3/30/World_map_with_arbitrarily_red_coloured_states.png')])
      .buttons([
        builder.CardAction.openUrl(session, 'https://world-domination-bot.herokuapp.com/api/ui/auth/facebook', 'View Map')
      ]),
  );
};
