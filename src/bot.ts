import { Client } from 'discord.js';

import { DISCORD_APP_BOT_TOKEN } from './environment';
// import { initialiseDatabase } from './db';
import logger from './logger';
import { execute, skip, clear, loop, list, setSongVolume } from './music';
import {
  playYoutubeURLRequests,
  clearRequests,
  listRequests,
  skipRequests,
} from './music/constants';

import { respond, interpretRequest, sendHelpDoc } from './social';
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
  // initialiseDatabase((message) => {
  //   console.log(message);
  //   console.log(`Alright, I'm all set up for my database.`);
  // });
});

djBotus.once('reconnecting', () => {
  console.log("Hold on, I'm reconnecting.");
});

djBotus.once('disconnect', () => {
  console.log("See ya, I'm outta here.");
});

djBotus.on('message', async (message) => {
  const userId = djBotus?.user?.id ?? '-';
  if (message.author.bot) {
    // Don't talk to itself or other bots
    return false;
  }

  if (message.content.match(/^;/) || message.mentions.has(userId)) {
    logger.log({
      level: 'info',
      message: `${message.author.tag} | ${message.author.id} | ${message.content}`,
    });
  }

  if (message.content.match(/^(;help[ ]?help)|(botus help[ ]?help)/gim)) {
    return message.channel.send('No help for you!');
  }
  if (message.content.match(/^(;h)|(;help)|(botus help)/gim)) {
    return sendHelpDoc(message);
  }

  // Looping
  if (message.content.match(/^;(loop track|ls|lt|loop song)/gim)) {
    return loop(message, 'song');
  }
  if (message.content.match(/^;lq|loop queue|lp/gim)) {
    return loop(message, 'playlist');
  }
  if (message.content.match(/^;loop stop/gim)) {
    return loop(message, 'off');
  }
  if (message.content.match(/^;l/gim)) {
    return loop(message);
  }
  if (message.content.match(/^;v/gim)) {
    return setSongVolume(message);
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
  if (interpretRequest(message, clearRequests)) {
    return clear(message);
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
    if (message.mentions.has(userId)) {
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

djBotus.login(DISCORD_APP_BOT_TOKEN);
