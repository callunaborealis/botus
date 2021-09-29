import { prefixCommandTerminatorPatternStr } from '../constants';
import { BOT_NAME } from '../environment';
import { LoopType, SongShape } from './types';

export const loopOrder: LoopType[] = ['playlist', 'song', 'off'];
export const loopOrderedMessages: string[] = [
  'Now looping the playlist.',
  'Now looping the song.',
  'No longer looping.',
];

export const maxAllowableVolume = 10; // Any more and we might all be deaf

/**
 * Default song shaped structure
 * denoting no song
 */
export const songScaffold: SongShape = {
  id: '-',
  title: '-',
  duration: 0,
  url: '#',
  volume: 0,
};

const trackTermSynonyms = ['track', 'song', 't', 's'];
export const trackTermsPattern = trackTermSynonyms.join('|');

// Makes the bot join your voice channel.
export const joinPrefixCommands = ['j', 'join'];
// /(j|join)(?:[ ]{1,}|$)(?![\d]+)/gim
export const joinPrefixCommandPatterns = [
  new RegExp(
    `(${joinPrefixCommands.join(
      '|',
    )})${prefixCommandTerminatorPatternStr}(?![\\d]+)`, // Ensure that j does not trigger jump instead
  ),
];

export const joinNaturalRequestExamples = ['join vc', 'join the voice chat'];
export const joinNaturalRequests = [
  'join(?: the)? vc',
  'join(?: the)? voice chat',
].map((v) => new RegExp(v, 'gim'));
export const disconnectVCPrefixCommands = [
  'dc',
  'fuckoff',
  'fuck off',
  'goaway',
  'go away',
  'getout',
  'get out',
  'kick',
  'leave',
  'reset',
  'bye',
];
export const disconnectVCPrefixCommandPatterns = disconnectVCPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);

export const loopTrackPrefixCommands = [
  'loop',
  'loop track',
  'looptrack',
  'loop song',
  'loopsong',
  'ls',
  'lt',
  'repeat',
];
export const loopTrackPrefixCommandPatterns = [
  new RegExp(
    `(${loopTrackPrefixCommands.join(
      '|',
    )})${prefixCommandTerminatorPatternStr}`,
    'gim',
  ),
];
export const loopTrackNaturalRequestExamples = [
  'play the current song again and again',
  'keep playing this song',
  'keep repeating this song',
  'repeat this song',
  'loop this song',
  'put this track on repeat',
  'ensure this song keeps playing',
  'stay on this song',
];

export const loopPlaylistPrefixCommands = ['lq', 'loop queue', 'lp'];
export const loopPlaylistPrefixCommandPatterns = loopPlaylistPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);

export const loopOffPrefixCommands = [
  'loop stop',
  'loopstop',
  'loop off',
  'loopoff',
];
export const loopOffPrefixCommandPatterns = loopOffPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);

export const loopCyclePrefixCommands = ['l', 'loop'];
export const loopCyclePrefixCommandPatterns = loopOffPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);

export const stopSongPrefixCommands = ['stop', 'enough', 'halt'];
/**
 * @deprecated
 */
export const stopSongRequests = [/^;(stop|enough|halt)$/gim];

/**
 * @deprecated
 */
export const disconnectVCRequests = [
  /^;(dc|fuck ?off|go ?away|get ?out|kick|leave|reset|bye)( (\w+)?)?$/gi,
];
export const resetPlaylistPrefixCommands = ['forcereset', 'hardreset'];
export const resetPlaylistPrefixCommandPatterns = [
  new RegExp(
    `(${resetPlaylistPrefixCommands.join(
      '|',
    )})${prefixCommandTerminatorPatternStr}`,
    'gim',
  ),
];

export const skipPrefixCommands = ['next', 'n', 'skip', 'jump'];
/**
 * @deprecated
 */
export const skipRequests = [
  // /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?BOT_NAME[,?!]? (skip|next|jump)/gim,
  new RegExp(
    `^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?${BOT_NAME.toLowerCase()}[,?!]? (skip|next|jump)`,
    'gim',
  ),
  // Groovy aliases
  /^;(next|n|skip|jump)/gim,
];

export const clearPrefixCommands = ['clear'];
/**
 * @deprecated
 */
export const clearRequests = [
  // /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?BOT_NAME[,?!]? clear/gim,
  new RegExp(
    `(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?${BOT_NAME.toLowerCase()}[,?!]? clear`,
    'gim',
  ),
  // Shortcut
  /^;clear/gim,
];

const debugPrefixCommands = ['debug'];
export const debugPrefixCommandPatterns = debugPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);
