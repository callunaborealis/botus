import { Message, MessageEmbed } from 'discord.js';

import isArray from 'lodash/isArray';
import random from 'lodash/random';

import { BOT_PREFIX, THEME_COLOUR } from '../constants';
import { ExtractedMsgBotRequestDetails, MsgBotRequestStyle } from './types';
import {
  botNameContentSeparator,
  helpPrefixCommands,
  helpMusicTypes,
  listOfGreetingsToBot,
} from './constants';
import {
  clearPrefixCommands,
  disconnectVCPrefixCommands,
  joinPrefixCommands,
  loopCyclePrefixCommands,
  loopOffPrefixCommands,
  loopPlaylistPrefixCommands,
  loopTrackPrefixCommands,
  playExistingTrackMandTrackPrefixCommands,
  playExistingTrackOptTrackPrefixCommands,
  playYoutubeLinkPrefixCommands,
} from '../music/constants';
import { setSongVolPrefixCommands } from '../music/volume/constants';
import { showPlaylistPrefixCommands } from '../music/list/constants';
import { removeTrackPrefixCommands } from '../music/rm/constants';

const botPrefix = BOT_PREFIX;

export const extractRequestDetailsForBot = (
  messageContent: Message['content'],
): ExtractedMsgBotRequestDetails => {
  /**
   * /^(?:;)([\\w]{1,})/gim;
   */
  const prefixHailPattern = new RegExp(
    [
      '^',
      `(?:${botPrefix})`,
      `([\\w\\s\\d${`!@#$%^&*()_+-=[]{};\':"\\|,.<>/?`
        .split('')
        .map((v) => `\\${v}`)
        .join('')}]+)$`,
    ].join(''),
    'gim',
  );
  const analysedListForPrefix = messageContent.split(prefixHailPattern);
  if (analysedListForPrefix.length === 3) {
    return {
      greeting: '',
      style: MsgBotRequestStyle.Prefix,
      requestStr: analysedListForPrefix[1],
    };
  }

  const botName = 'botus';

  const nameThenOptionalGreetingPattern = new RegExp(
    [
      '^',
      botName,
      botNameContentSeparator,
      '(',
      listOfGreetingsToBot.join('|'),
      ')?',
      `(?:${botNameContentSeparator}|$)`,
    ].join(''),
    'gim',
  );
  const optionalGreetingThenNamePattern = new RegExp(
    [
      '^',
      '(?:',
      '(',
      listOfGreetingsToBot.join('|'),
      ')',
      botNameContentSeparator,
      ')?',
      botName,
      `(?:${botNameContentSeparator}|$)`,
    ].join(''),
    'gim',
  );

  const analysisForNameThenOptGreetPattern = messageContent.split(
    nameThenOptionalGreetingPattern,
  );

  if (analysisForNameThenOptGreetPattern.length === 3) {
    return {
      style: MsgBotRequestStyle.Natural,
      greeting: analysisForNameThenOptGreetPattern[1] ?? '',
      requestStr: analysisForNameThenOptGreetPattern[2],
    };
  }

  const analysisForOptGreetThenNamePattern = messageContent.split(
    optionalGreetingThenNamePattern,
  );

  if (analysisForOptGreetThenNamePattern.length === 3) {
    return {
      style: MsgBotRequestStyle.Natural,
      requestStr: analysisForOptGreetThenNamePattern[2],
      greeting: analysisForOptGreetThenNamePattern[1] ?? '',
    };
  }
  return {
    greeting: '',
    style: MsgBotRequestStyle.NotARequest,
    requestStr: '',
  };
};

type RequestIdentified<S> =
  | { index: number; matches: S }
  | { index: -1; matches: [] };
export const identifyRequest = <
  SuccessMatchShape extends (string | undefined)[]
>(
  messageContent: string,
  listOfMatches: RegExp[],
): RequestIdentified<SuccessMatchShape> => {
  return listOfMatches.reduce(
    (eventual, eachMatch, i) => {
      const m = messageContent.split(eachMatch);
      if (Array.isArray(m) && m.length > 1) {
        return {
          index: i,
          matches: m as SuccessMatchShape,
        };
      }
      return eventual;
    },
    {
      index: -1,
      matches: [],
    } as RequestIdentified<SuccessMatchShape>,
  );
};

/**
 * @deprecated
 */
export const interpretRequest = (message: Message, listOfMatches: RegExp[]) => {
  let matched = false;
  for (let i = 0; i < listOfMatches.length; i++) {
    const pattern = new RegExp(listOfMatches[i]);
    const matches = message.content.match(pattern);
    if (isArray(matches) && matches.length > 0) {
      matched = true;
      break;
    }
  }
  return matched;
};

// Don't mention the user
export const respond = (
  message: Message,
  listOfResponses: ((username: string) => string)[],
) => {
  const i = random(0, listOfResponses.length - 1);
  const responseChoice = listOfResponses[i];
  return message.channel.send(responseChoice(message.author.username));
};

export const reply = (message: Message, reply: string) => {
  return message.reply(reply);
};

export const sendHelpDoc = (message: Message, helpType: 'music' | 'about') => {
  if (helpType === 'music') {
    const musicHelpEmbed = new MessageEmbed()
      .setColor(THEME_COLOUR)
      .setTitle(`**Music**`)
      .setDescription(
        'I\'m mostly like Groovy but with a ";" instead of a "-" prefix.',
      )
      .addFields(
        {
          name: 'Plays / Adds a YouTube track or playlist to the playlist',
          value: [
            playYoutubeLinkPrefixCommands
              .map((cmd) => `\`${cmd}\``)
              .join(' , '),
            '\n',
            '**e.g.**',
            '\n',
            `\`${playYoutubeLinkPrefixCommands[0]} {youtube link/playlist}\` -- Adds a track and plays it if it's the first track.`,
            '\n',
            '`botus play/add {youtube link/playlist}`    -- Plays / Adds a YouTube track or playlist to the playlist',
            '\n',
            `\`${botPrefix}${playYoutubeLinkPrefixCommands[0]} {youtube link/playlist} at vol 5.4\` -- With volume set at 5.4 out of 10`,
            '\n',
            '`botus play/add {youtube link/playlist} at volume 4`  -- With volume set at 4 out of 10',
          ].join(''),
        },
        {
          name: 'Plays an existing track on the playlist',
          value: [
            playExistingTrackOptTrackPrefixCommands
              .map((cmd) => `\`${cmd}\``)
              .join(' , '),
            ',',
            playExistingTrackMandTrackPrefixCommands
              .map((cmd) => `\`${cmd} track\``)
              .join(' , '),
            ',',
            playExistingTrackMandTrackPrefixCommands
              .map((cmd) => `\`${cmd} song\``)
              .join(' , '),
            '\n',
            '**e.g.**',
            '\n',
            `\`${botPrefix}${playExistingTrackMandTrackPrefixCommands[0]} track 2\` -- Plays track 2`,
            '\n',
            `\`${botPrefix}${playExistingTrackMandTrackPrefixCommands[1]} song 3\` -- Plays track 3`,
            '\n',
            `\`${botPrefix}${playExistingTrackOptTrackPrefixCommands[0]} 1\` -- Plays track 1`,
          ].join(''),
        },
        {
          name: 'Joins the voice channel',
          value: [
            joinPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`;${joinPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Disconnects from the voice channel',
          value: [
            disconnectVCPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`;${disconnectVCPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Removes a track',
          value: [
            removeTrackPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            'Removing the current track skips or ends the playlist.',
            '\n',
            '**e.g.**',
            ' ',
            `\`;${removeTrackPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Shows the playlist tracks',
          value: [
            showPlaylistPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            'Removing the current track skips or ends the playlist.',
            '\n',
            '**e.g.**',
            '\n',
            `\`${botPrefix}${showPlaylistPrefixCommands[0]}\` - Shows tracks. If more than 1 page, shows page of current track. If nothing playing, it shows the first page.`,
            '\n',
            `\`${botPrefix}${showPlaylistPrefixCommands[0]} page 4\` - Shows page 4 of the playlist.`,
          ].join(''),
        },
        {
          name: 'Cycle through loop playlist options',
          value: [
            loopCyclePrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`${botPrefix}${loopCyclePrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Loop (Playlist)',
          value: [
            loopPlaylistPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`${botPrefix}${loopPlaylistPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Loop (Track)',
          value: [
            loopTrackPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`${botPrefix}${loopTrackPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Loop (Off)',
          value: [
            loopOffPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`${botPrefix}${loopOffPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Set volume of current track',
          value: [
            setSongVolPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            '\n',
            `\`${botPrefix}${setSongVolPrefixCommands[0]} 5\` - Sets volume 5 for the current track`,
            '\n',
            `\`${botPrefix}${setSongVolPrefixCommands[0]} 5.5 track 3\` - Sets volume 5.5 for track 3`,
            '\n',
            `\`${botPrefix}${setSongVolPrefixCommands[0]} track 4 volume 3.45\` - Sets volume 3.45 for track 4`,
          ].join(''),
        },
        {
          name: 'Stops and clears the playlist',
          value: [
            clearPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            ' ',
            `\`${botPrefix}${clearPrefixCommands[0]}\``,
          ].join(''),
        },
        {
          name: 'Shows this help message',
          value: [
            helpPrefixCommands.map((cmd) => `\`${cmd}\``).join(' , '),
            '\n',
            '**e.g.**',
            '\n',
            `\`${botPrefix}${helpPrefixCommands[1]} ${helpMusicTypes[0]}\` - Help Music`,
          ].join(''),
        },
      );
    return message.channel.send(musicHelpEmbed);
  }
  const aboutEmbed = new MessageEmbed()
    .setColor(THEME_COLOUR)
    .setTitle(
      `**Botus - Music and Social Discord Bot, former Bald Insurgent Leader**`,
    )
    .addFields(
      { name: ':checkered_flag: Version', value: '1.0.0', inline: true },
      {
        name: ':tools: Developer',
        value: 'CallunaBorealis#0001',
        inline: true,
      },
      {
        name: ':link: Invite Link',
        value:
          'https://discord.com/api/oauth2/authorize?client_id=803234675446906920&permissions=3795320640&scope=bot',
        inline: false,
      },
      {
        name: ':books: Wiki',
        value: 'https://github.com/callunaborealis/botus/wiki',
        inline: true,
      },
      {
        name: ':tools: Issues and Suggestions',
        value: 'https://github.com/callunaborealis/botus/issues',
        inline: true,
      },
      {
        name: ':notepad_spiral: List of Commands',
        value: `Type \`${botPrefix}${helpPrefixCommands[1]}\` to get this help menu.\nType \`${botPrefix}${helpPrefixCommands[1]} ${helpMusicTypes[0]}\` to get a list of music commands.`,
        inline: false,
      },
      {
        name: ':game_die: How are dice rolls calculated?',
        value:
          'All dice are rolled using the `ckknight/random-js` library extended by the `nodeCrypto` "engine". Technical details about how random numbers are calculated here: https://github.com/ckknight/random-js.',
        inline: false,
      },
    );

  message.channel.send(aboutEmbed);
  return;
};

export const reactWithEmoji = {
  received: (message: Message) => {
    try {
      message.reactions.removeAll();
      message.react('👌');
    } catch (error) {
      console.error(error);
    }
  },
  failed: (message: Message) => {
    try {
      message.reactions.removeAll();
      message.react('⚠️');
    } catch (error) {
      console.error(error);
    }
  },
  succeeded: (message: Message) => {
    try {
      message.reactions.removeAll();
      message.react('✅');
    } catch (error) {
      console.error(error);
    }
  },
};
