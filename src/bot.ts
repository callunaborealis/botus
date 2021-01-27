import { Client } from 'discord.js';

import { initialiseDatabase } from './db';
import {
  playYoutubeURLRequests,
  execute,
  skip,
  stop,
  list,
  listRequests,
  skipRequests,
  stopRequests,
} from './music';

import { respond, interpretRequest } from './social';
import {
  defaultResponses,
  gratitudeRequests,
  gratitudeResponses,
  greetingRequests,
  greetingResponses,
  howsItGoingRequests,
  hailRequests,
  hailResponses,
  howsItGoingResponses,
} from './social/constants';

const djBotus = new Client();

djBotus.on('ready', () => {
  const userTag = djBotus?.user?.tag ?? '-';
  console.log(`Alright pal, I'm up. My handle is ${userTag}.`);
  initialiseDatabase((message) => {
    console.log(message);
    console.log(`Alright, I'm all set up for my database.`);
  });
});

djBotus.once('reconnecting', () => {
  console.log("Hold on, I'm reconnecting.");
});

djBotus.once('disconnect', () => {
  console.log("See ya, I'm outta here.");
});

djBotus.on('message', async (message) => {
  const userTag = djBotus?.user?.tag ?? '-';
  if (message.author.bot) {
    // Don't talk to itself or other bots
    return false;
  }

  // Music
  if (interpretRequest(message, playYoutubeURLRequests)) {
    return execute(message);
  }
  if (interpretRequest(message, listRequests)) {
    return list(message);
  }
  if (interpretRequest(message, skipRequests)) {
    return skip(message);
  }
  if (interpretRequest(message, stopRequests)) {
    return stop(message);
  }

  // Social
  const howsItGoingAsked = interpretRequest(message, howsItGoingRequests);
  if (howsItGoingAsked) {
    return respond(message, howsItGoingResponses);
  }

  if (interpretRequest(message, greetingRequests)) {
    return respond(message, greetingResponses);
  }

  if (interpretRequest(message, gratitudeRequests)) {
    return respond(message, gratitudeResponses);
  }

  const isHailed = (() => {
    if (message.mentions.has(userTag)) {
      // Respond to mentions of it
      return true;
    }

    return interpretRequest(message, hailRequests);
  })();
  if (isHailed) {
    return respond(message, hailResponses);
  }

  if (message.content.startsWith('botus')) {
    return respond(message, defaultResponses);
  }
});

djBotus.login(process.env.DISCORD_APP_BOT_TOKEN);
