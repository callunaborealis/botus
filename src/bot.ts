import { Client } from 'discord.js';

import { DISCORD_APP_BOT_TOKEN } from './environment';
import logger from './logger';

import { respondWithDiceResult } from './ttrpg';
import { rollDiceRequests } from './ttrpg/constants';
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
  createServerSession,
  joinVoiceChannel,
  disconnectVoiceChannel,
  displayDebugValues,
} from './music';
import {
  playYoutubeURLRequests,
  playExistingTrackRequests,
  joinVCRequests,
  disconnectVCRequests,
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
  resetPlaylistRequests,
} from './music/constants';

import {
  respond,
  interpretRequest,
  sendHelpDoc,
  extractRequestDetailsForBot,
} from './social';
import {
  defaultResponses,
  gratitudeRequests,
  gratitudeResponses,
  greetingRequests,
  greetingResponses,
  howIsItGoingRequests,
  howAreYouRequests,
  hailRequests,
  hailResponses,
  howsItGoingResponses,
  howAreYouResponses,
  helphelpRequests,
  helpRequests,
  hugRequests,
  hugResponses,
  meaningOfLifeRequests,
  meaningOfLifeResponses,
} from './social/constants';
import { MsgBotRequestStyle } from './social/types';

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

  const requestDetails = extractRequestDetailsForBot(message.content);

  const messageContent = (() => {
    if (message.mentions.has(userId)) {
      // Respond to mentions of it
      return message.content;
    }
    return requestDetails.requestStr;
  })();

  if (requestDetails.style !== MsgBotRequestStyle.NotARequest) {
    logger.log({
      level: 'info',
      message: `${message.author.tag} | ${message.author.id} | ${message.content} | ${requestDetails.requestStr}`,
    });
  }

  // TTRPG
  if (interpretRequest(message, rollDiceRequests)) {
    return respondWithDiceResult(message);
  }

  // Help
  if (interpretRequest(message, helphelpRequests)) {
    return message.channel.send('No help for you!');
  }
  if (interpretRequest(message, helpRequests)) {
    return sendHelpDoc(message);
  }

  // Music: Debug - Hard resets the server session on the spot in case of failure
  if (interpretRequest(message, resetPlaylistRequests)) {
    return createServerSession(message);
  }
  if (interpretRequest(message, [/^;debug$/gim])) {
    return displayDebugValues(message);
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
  if (interpretRequest(message, joinVCRequests)) {
    return joinVoiceChannel(message);
  }
  if (interpretRequest(message, disconnectVCRequests)) {
    return disconnectVoiceChannel(message);
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
  if (interpretRequest(message, howIsItGoingRequests)) {
    return respond(message, howsItGoingResponses);
  }
  if (interpretRequest(message, howAreYouRequests)) {
    return respond(message, howAreYouResponses);
  }

  if (interpretRequest(message, greetingRequests)) {
    return respond(message, greetingResponses);
  }

  if (interpretRequest(message, meaningOfLifeRequests)) {
    return respond(message, meaningOfLifeResponses);
  }

  if (interpretRequest(message, gratitudeRequests)) {
    return respond(message, gratitudeResponses);
  }

  const isMentioned = (() => {
    if (message.mentions.has(userId)) {
      // Respond to mentions of it
      return true;
    }
    if (message.content.match(/(?:(^|\s))botus(?=\W|$)/gim)) {
      return true;
    }
    return interpretRequest(message, hailRequests);
  })();
  if (isMentioned) {
    return respond(message, hailResponses);
  }

  if (message.content.match(/^botus(?=\W|$)/gim)) {
    return respond(message, defaultResponses);
  }
});

djBotus.login(DISCORD_APP_BOT_TOKEN);
