import { Client } from 'discord.js';
import isString from 'lodash/isString';

import { BOT_NAME, DISCORD_APP_BOT_TOKEN } from './environment';
import logger from './logger';

import { respondWithDiceResult } from './ttrpg';
import { rollDicePrefixPatterns } from './ttrpg/constants';
import {
  skip,
  clear,
  loop,
  stop,
  joinVoiceChannel,
  disconnectVoiceChannel,
  displayDebugValues,
} from './music';
import { createServerSession } from './music/session';
import {
  clearRequests,
  skipRequests,
  stopSongRequests,
  resetPlaylistPrefixCommandPatterns,
  debugPrefixCommandPatterns,
  loopPlaylistPrefixCommandPatterns,
  loopTrackPrefixCommandPatterns,
  loopCyclePrefixCommandPatterns,
  loopOffPrefixCommandPatterns,
  joinPrefixCommandPatterns,
  disconnectVCPrefixCommandPatterns,
} from './music/constants';
import { list } from './music/list';
import { getTrackNrFromRmSongCommand, removeSong } from './music/rm';
import {
  showPlaylistNaturalRequestPatterns,
  showPlaylistPrefixCommandPatterns,
} from './music/list/constants';

import {
  respond,
  interpretRequest,
  sendHelpDoc,
  extractRequestDetailsForBot,
  identifyRequest,
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
  hugRequests,
  hugResponses,
  meaningOfLifeRequests,
  meaningOfLifeResponses,
  helpPrefixCommandPatterns,
  helpNaturalRequestPatterns,
  helpHelpPrefixCommandPatterns,
} from './social/constants';
import {
  HelpNaturalRequestMatchesShape,
  HelpPrefixRequestMatchesShape,
  MsgBotRequestStyle,
} from './social/types';
import { DiceRequestStrMatchesShape } from './ttrpg/types';
import {
  setSongVolNaturalRequestPatterns,
  setSongVolPrefixCommandPatterns,
} from './music/volume/constants';
import { TrackVolPrefixCommandMatches } from './music/volume/types';
import { extractNaturalSetVolumeDetails, setSongVolume } from './music/volume';
import {
  ListNaturalRequestMatches,
  ListPrefixCommandMatches,
} from './music/list/types';
import { getPageNrFromNaturalRequestMatches } from './music/list/helper';
import { removeTrackPrefixCommandPatterns } from './music/rm/constants';
import { playExistingTrack } from './music/play/existing';
import { playExistingTrackPrefixCommandPatterns } from './music/play/existing/constants';
import { playAndOrAddYoutubeToPlaylist } from './music/play/youtube/link';
import {
  playYouTubeLinkPrefixCommandPatterns,
  playYoutubeURLRequests,
} from './music/play/youtube/constants';

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

  if (requestDetails.style !== MsgBotRequestStyle.NotARequest) {
    logger.log({
      level: 'info',
      message: `${message.author.tag} | ${message.author.id} | ${message.content} | ${requestDetails.requestStr}`,
    });
  }

  const messageContent = (() => {
    if (message.mentions.has(userId)) {
      // Respond to mentions of it
      return message.content;
    }
    return requestDetails.requestStr;
  })();

  // TTRPG
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const { matches } = identifyRequest<DiceRequestStrMatchesShape>(
      messageContent,
      rollDicePrefixPatterns,
    );
    if (matches.length > 1) {
      const [_, diceFormatStr] = matches;
      return respondWithDiceResult(message, diceFormatStr as string);
    }
  }

  // Help
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const helpPrefixMatchDetails = identifyRequest<HelpPrefixRequestMatchesShape>(
      messageContent,
      helpPrefixCommandPatterns,
    );
    if (helpPrefixMatchDetails.matches?.[1] === 'music') {
      return sendHelpDoc(message, 'music');
    }
    if (helpPrefixMatchDetails.index !== -1) {
      return sendHelpDoc(message, 'about');
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Natural) {
    const helpMatchDetails = identifyRequest<HelpNaturalRequestMatchesShape>(
      messageContent,
      helpNaturalRequestPatterns,
    );
    if (isString(helpMatchDetails.matches[2])) {
      return sendHelpDoc(message, 'music');
    }
    if (helpMatchDetails.index !== -1) {
      return sendHelpDoc(message, 'about');
    }
  }

  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const helpHelpMatchDetails = identifyRequest(
      messageContent,
      helpHelpPrefixCommandPatterns,
    );
    if (helpHelpMatchDetails.index !== -1) {
      return message.channel.send('No help for you!');
    }
  }

  // Music: Debug - Hard resets the server session on the spot in case of failure
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const hardResetDetails = identifyRequest(
      messageContent,
      resetPlaylistPrefixCommandPatterns,
    );
    if (hardResetDetails.index !== -1) {
      return createServerSession(message, true);
    }
    const debugDetails = identifyRequest(
      messageContent,
      debugPrefixCommandPatterns,
    );
    if (debugDetails.index !== -1) {
      return displayDebugValues(message);
    }
  }

  // Music: Loop
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const loopTrackDetails = identifyRequest(
      messageContent,
      loopTrackPrefixCommandPatterns,
    );
    if (loopTrackDetails.index !== -1) {
      return loop(message, 'song');
    }
    const loopPlaylistDetails = identifyRequest(
      messageContent,
      loopPlaylistPrefixCommandPatterns,
    );
    if (loopPlaylistDetails.index !== -1) {
      return loop(message, 'playlist');
    }
    const loopOffDetails = identifyRequest(
      messageContent,
      loopOffPrefixCommandPatterns,
    );
    if (loopOffDetails.index !== -1) {
      return loop(message, 'off');
    }
    const loopCycleDetails = identifyRequest(
      messageContent,
      loopCyclePrefixCommandPatterns,
    );
    if (loopCycleDetails.index !== -1) {
      return loop(message);
    }
  }

  // Music: Voice Connection
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const joinVCDetails = identifyRequest(
      messageContent,
      joinPrefixCommandPatterns,
    );
    if (joinVCDetails.index !== -1) {
      return joinVoiceChannel(message);
    }
    const dcVCDetails = identifyRequest(
      messageContent,
      disconnectVCPrefixCommandPatterns,
    );
    if (dcVCDetails.index !== -1) {
      return disconnectVoiceChannel(message);
    }
  }

  // Music: Playlist Management
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const showPlaylistPrefixDetails = identifyRequest<
      ListPrefixCommandMatches[0]
    >(messageContent, showPlaylistPrefixCommandPatterns);
    if (showPlaylistPrefixDetails.index !== -1) {
      if (showPlaylistPrefixDetails.matches[3]) {
        const pageNrRequested = parseInt(
          showPlaylistPrefixDetails.matches[3],
          10,
        );
        return list(message, { pageNrRequested });
      }
      return list(message, {});
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Natural) {
    const showPlaylistPrefixDetails = identifyRequest<
      ListNaturalRequestMatches[0]
    >(messageContent, showPlaylistNaturalRequestPatterns);
    if (showPlaylistPrefixDetails.index !== -1) {
      const pageNrRequested = getPageNrFromNaturalRequestMatches(
        showPlaylistPrefixDetails.index,
        showPlaylistPrefixDetails.matches,
      );
      return list(message, { pageNrRequested });
    }
  }

  // Music: Volume
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const setVolPrefixDetails = identifyRequest(
      messageContent,
      setSongVolPrefixCommandPatterns,
    );
    if (setVolPrefixDetails.index === 0) {
      const matches = setVolPrefixDetails.matches as TrackVolPrefixCommandMatches[0];
      return setSongVolume(message, {
        volume: matches[1],
        track: matches[2],
      });
    }
    if (setVolPrefixDetails.index === 1) {
      const matches = setVolPrefixDetails.matches as TrackVolPrefixCommandMatches[1];
      return setSongVolume(message, {
        volume: matches[2],
        track: matches[1],
      });
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Natural) {
    const setVolNaturalDetails = identifyRequest(
      messageContent,
      setSongVolNaturalRequestPatterns,
    );
    if (setVolNaturalDetails.index >= 0) {
      const naturalVolDetails = extractNaturalSetVolumeDetails({
        index: setVolNaturalDetails.index,
        matches: setVolNaturalDetails.matches,
      });
      return setSongVolume(message, {
        volume: naturalVolDetails.volume.toString(), // TODO: Remove yo-yo string conversion
        track: naturalVolDetails.track.toString(),
      });
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const rmTrackPrefixDetails = identifyRequest(
      messageContent,
      removeTrackPrefixCommandPatterns,
    );
    const trackNr = getTrackNrFromRmSongCommand(rmTrackPrefixDetails.matches);
    if (rmTrackPrefixDetails.index === 0) {
      return removeSong(message, { trackNr });
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const playExistingTrackPrefixDetails = identifyRequest(
      messageContent,
      playExistingTrackPrefixCommandPatterns,
    );
    if (playExistingTrackPrefixDetails.index !== -1) {
      return playExistingTrack(message, {
        trackNr: parseInt(`${playExistingTrackPrefixDetails.matches[1]}`, 10),
      });
    }
  }

  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const playYouTubeLinkPrefixDetails = identifyRequest(
      messageContent,
      playYouTubeLinkPrefixCommandPatterns,
    );
    if (playYouTubeLinkPrefixDetails.index !== -1) {
      return playAndOrAddYoutubeToPlaylist(message);
    }
  }

  // Music: Playlist Management
  if (interpretRequest(message, playYoutubeURLRequests)) {
    return playAndOrAddYoutubeToPlaylist(message);
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
    if (
      // /(?:(^|s))BOT_NAME(?=W|$)/gim
      message.content.match(
        new RegExp(`(?:(^|s))${BOT_NAME.toLowerCase()}(?=W|$)`, 'gim'),
      )
    ) {
      return true;
    }
    return interpretRequest(message, hailRequests);
  })();
  if (isMentioned) {
    return respond(message, hailResponses);
  }

  if (
    message.content.match(
      new RegExp(`^${BOT_NAME.toLowerCase()}(?=\W|$)`, 'gim'),
    )
  ) {
    return respond(message, defaultResponses);
  }
});

djBotus.login(DISCORD_APP_BOT_TOKEN);
