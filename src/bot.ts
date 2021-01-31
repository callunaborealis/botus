import { Client } from 'discord.js';

import { DISCORD_APP_BOT_TOKEN } from './environment';
// import { initialiseDatabase } from './db';
import logger from './logger';
import {
  playAndOrAddYoutubeToPlaylist,
  skip,
  clear,
  loop,
  list,
  setSongVolume,
  removeSong,
  stop,
  playExistingTrack,
} from './music';
import {
  playYoutubeURLRequests,
  playExistingTrackRequests,
  clearRequests,
  listRequests,
  skipRequests,
  loopPlaylistRequests,
  loopTrackRequests,
  loopOffRequests,
  loopCycleRequests,
  setSongVolRequests,
  removeSongRequests,
  stopSongRequests,
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
  helphelpRequests,
  helpRequests,
  hugRequests,
  hugResponses,
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

  // Help
  if (interpretRequest(message, helphelpRequests)) {
    return message.channel.send('No help for you!');
  }
  if (interpretRequest(message, helpRequests)) {
    return sendHelpDoc(message);
  }

  // Music: Loop
  if (interpretRequest(message, loopTrackRequests)) {
    return loop(message, 'song');
  }
  if (interpretRequest(message, loopPlaylistRequests)) {
    return loop(message, 'playlist');
  }
  if (interpretRequest(message, loopOffRequests)) {
    return loop(message, 'off');
  }
  if (interpretRequest(message, loopCycleRequests)) {
    return loop(message);
  }

  // Music: Volume
  if (interpretRequest(message, setSongVolRequests)) {
    return setSongVolume(message);
  }
  if (interpretRequest(message, removeSongRequests)) {
    return removeSong(message);
  }

  // Music: Playlist Management
  if (interpretRequest(message, playExistingTrackRequests)) {
    return playExistingTrack(message);
  }
  if (interpretRequest(message, playYoutubeURLRequests)) {
    return playAndOrAddYoutubeToPlaylist(message);
  }
  if (interpretRequest(message, listRequests)) {
    return list(message);
  }
  if (interpretRequest(message, skipRequests)) {
    return skip(message);
  }
  if (interpretRequest(message, stopSongRequests)) {
    return stop(message);
  }
  if (interpretRequest(message, clearRequests)) {
    return clear(message);
  }

  // Social
  if (interpretRequest(message, hugRequests)) {
    return respond(message, hugResponses);
  }
  if (interpretRequest(message, howsItGoingRequests)) {
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
