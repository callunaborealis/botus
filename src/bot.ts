import { Client, Intents } from 'discord.js';
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
import { fastForwardPrefixCommandPatterns } from './music/ff/constants';
import { fastForward } from './music/ff';

const djBotus = new Client({
  intents: Object.values(Intents.FLAGS),
});

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
    return;
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
      respondWithDiceResult(message, diceFormatStr as string);
      return;
    }
  }
  // Help
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const helpPrefixMatchDetails = identifyRequest<HelpPrefixRequestMatchesShape>(
      messageContent,
      helpPrefixCommandPatterns,
    );
    if (helpPrefixMatchDetails.matches?.[1] === 'music') {
      sendHelpDoc(message, 'music');
      return;
    }
    if (helpPrefixMatchDetails.index !== -1) {
      sendHelpDoc(message, 'about');
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Natural) {
    const helpMatchDetails = identifyRequest<HelpNaturalRequestMatchesShape>(
      messageContent,
      helpNaturalRequestPatterns,
    );
    if (isString(helpMatchDetails.matches[2])) {
      sendHelpDoc(message, 'music');
      return;
    }
    if (helpMatchDetails.index !== -1) {
      sendHelpDoc(message, 'about');
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const helpHelpMatchDetails = identifyRequest(
      messageContent,
      helpHelpPrefixCommandPatterns,
    );
    if (helpHelpMatchDetails.index !== -1) {
      message.channel.send('No help for you!');
      return;
    }
  }
  // Music: Debug - Hard resets the server session on the spot in case of failure
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const hardResetDetails = identifyRequest(
      messageContent,
      resetPlaylistPrefixCommandPatterns,
    );
    if (hardResetDetails.index !== -1) {
      createServerSession(message, true);
      return;
    }
    const debugDetails = identifyRequest(
      messageContent,
      debugPrefixCommandPatterns,
    );
    if (debugDetails.index !== -1) {
      displayDebugValues(message);
      return;
    }
  }
  // Music: Loop
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const loopTrackDetails = identifyRequest(
      messageContent,
      loopTrackPrefixCommandPatterns,
    );
    if (loopTrackDetails.index !== -1) {
      loop(message, 'song');
      return;
    }
    const loopPlaylistDetails = identifyRequest(
      messageContent,
      loopPlaylistPrefixCommandPatterns,
    );
    if (loopPlaylistDetails.index !== -1) {
      loop(message, 'playlist');
      return;
    }
    const loopOffDetails = identifyRequest(
      messageContent,
      loopOffPrefixCommandPatterns,
    );
    if (loopOffDetails.index !== -1) {
      loop(message, 'off');
      return;
    }
    const loopCycleDetails = identifyRequest(
      messageContent,
      loopCyclePrefixCommandPatterns,
    );
    if (loopCycleDetails.index !== -1) {
      loop(message);
      return;
    }
  }
  // Music: Voice Connection
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const joinVCDetails = identifyRequest(
      messageContent,
      joinPrefixCommandPatterns,
    );
    if (joinVCDetails.index !== -1) {
      joinVoiceChannel(message);
      return;
    }
    const dcVCDetails = identifyRequest(
      messageContent,
      disconnectVCPrefixCommandPatterns,
    );
    if (dcVCDetails.index !== -1) {
      disconnectVoiceChannel(message);
      return;
    }
  }
  // Music: Playlist Management
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const showPlaylistPrefixDetails = identifyRequest<
      ListPrefixCommandMatches[0]
    >(messageContent, showPlaylistPrefixCommandPatterns);
    if (showPlaylistPrefixDetails.index !== -1) {
      if (showPlaylistPrefixDetails.matches[2]) {
        const pageNrRequested = parseInt(
          showPlaylistPrefixDetails.matches[2],
          10,
        );
        list(message, { pageNrRequested });
        return;
      }
      list(message, {});
      return;
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
      list(message, { pageNrRequested });
      return;
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
      setSongVolume(message, {
        volume: matches[1],
        track: matches[2],
      });
      return;
    }
    if (setVolPrefixDetails.index === 1) {
      const matches = setVolPrefixDetails.matches as TrackVolPrefixCommandMatches[1];
      setSongVolume(message, {
        volume: matches[2],
        track: matches[1],
      });
      return;
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
      setSongVolume(message, {
        volume: naturalVolDetails.volume.toString(), // TODO: Remove yo-yo string conversion
        track: naturalVolDetails.track.toString(),
      });
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const rmTrackPrefixDetails = identifyRequest(
      messageContent,
      removeTrackPrefixCommandPatterns,
    );
    const trackNr = getTrackNrFromRmSongCommand(rmTrackPrefixDetails.matches);
    if (rmTrackPrefixDetails.index === 0) {
      removeSong(message, { trackNr });
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const playExistingTrackPrefixDetails = identifyRequest(
      messageContent,
      playExistingTrackPrefixCommandPatterns,
    );
    if (playExistingTrackPrefixDetails.index !== -1) {
      playExistingTrack(message, {
        trackNr: parseInt(`${playExistingTrackPrefixDetails.matches[1]}`, 10),
      });
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const playYouTubeLinkPrefixDetails = identifyRequest(
      messageContent,
      playYouTubeLinkPrefixCommandPatterns,
    );
    if (playYouTubeLinkPrefixDetails.index !== -1) {
      playAndOrAddYoutubeToPlaylist(message);
      return;
    }
  }
  if (requestDetails.style === MsgBotRequestStyle.Prefix) {
    const fastForwardTrackPrefixDetails = identifyRequest(
      messageContent,
      fastForwardPrefixCommandPatterns,
    );
    if (fastForwardTrackPrefixDetails.index !== -1) {
      fastForward(message);
      return;
    }
  }
  // Music: Playlist Management
  if (interpretRequest(message, playYoutubeURLRequests)) {
    playAndOrAddYoutubeToPlaylist(message);
    return;
  }
  if (interpretRequest(message, skipRequests)) {
    skip(message);
    return;
  }
  if (interpretRequest(message, stopSongRequests)) {
    stop(message);
    return;
  }
  if (interpretRequest(message, clearRequests)) {
    clear(message);
    return;
  }
  // Social
  if (interpretRequest(message, hugRequests)) {
    respond(message, hugResponses);
    return;
  }
  if (interpretRequest(message, howIsItGoingRequests)) {
    respond(message, howsItGoingResponses);
    return;
  }
  if (interpretRequest(message, howAreYouRequests)) {
    respond(message, howAreYouResponses);
    return;
  }
  if (interpretRequest(message, greetingRequests)) {
    respond(message, greetingResponses);
    return;
  }
  if (interpretRequest(message, meaningOfLifeRequests)) {
    respond(message, meaningOfLifeResponses);
    return;
  }
  if (interpretRequest(message, gratitudeRequests)) {
    respond(message, gratitudeResponses);
    return;
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
    respond(message, hailResponses);
    return;
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
