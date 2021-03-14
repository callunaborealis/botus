import { prefixCommandTerminatorPatternStr } from '../constants';
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
  url: '#',
  volume: 0,
};

// Makes the bot join your voice channel.
export const joinPrefixCommands = ['j', 'join'];
export const joinPrefixCommandPatterns = [
  new RegExp(
    `(${joinPrefixCommands.join('|')})${prefixCommandTerminatorPatternStr}`,
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

/**
 * @deprecated
 */
export const removeSongRequests = [
  /^;rm [\d]+/gim,
  /(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]?([\w\d\s]{0,})? (remove|take away|delete|throw|get rid of|discard|take out|take away) (track|song) [\d]+( |$)/gim,
];
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

export const existingTrackPattern = new RegExp(/([\d]+)/gim);
export const playExistingTrackOptTrackPrefixCommands = ['p', 'play', 'add'];
export const playExistingTrackMandTrackPrefixCommands = ['q', 'queue'];
const trackPrefixTerms = ['track', 'song'];
export const playExistingTrackPrefixCommands = [
  /**
   * /^;(p|play|add)( track| song)? ([\d]+)/gim,
   */
  [
    `(?:${playExistingTrackOptTrackPrefixCommands.join('|')})`,
    `(?: ${trackPrefixTerms.join('|')})?`,
    ' ',
    '([\\d]+)',
  ],
  /**
   * Ensure that it doesn't conflict with list
   * /^;(q|queue) (track|song) ([\d]+)/gim,
   */
  [
    playExistingTrackMandTrackPrefixCommands.join('|'),
    ' ',
    `(?:${trackPrefixTerms.join('|')})`,
    ' ',
    '([\\d]+)',
  ],
];
/**
 * @deprecated
 */
export const playExistingTrackRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}(play|add)( track| song)? ([\d]+)/gim,
  /^;(p|play|add)( track| song)? ([\d]+)/gim,
  // Ensure that it doesn't conflict with list
  /^;(q|queue) (track|song) ([\d]+)/gim,
];

export const playYoutubeLinkPrefixCommands = ['q', 'queue', 'p', 'play', 'add'];
/**
 * /((?:https?:\/\/)?(?:(?:(?:www.?)?youtube.com(?:\/(?:(?:watch?\S*?(?:v=[^\&\s]+)\S*)|(?:v(?:\S*))|(?:channel\S+)|(?:user\/(\S+))|(?:results?(?:search_query=\S+))))?)|(?:youtu\.be(?:\S*)?)))/gim
 */
export const youtubeLinkPatternStr =
  '((?:https?:\\/\\/)?(?:(?:(?:www\\.?)?youtube.com(?:\\/(?:(?:watch\\?\\S*?(?:v=[^\\&\\s]+)\\S*)|(?:v(?:\\S*))|(?:channel\\S+)|(?:user\\/(\\S+))|(?:results?(?:search_query=\\S+))))?)|(?:youtu\\.be(?:\\S*)?)))';
/**
 * @deprecated
 */
export const playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus ... play/add [youtube link] (natural language processing)
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}(queue|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
  // ;p [youtube link] (shortcut)
  /^;(q|queue|p|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
];

export const skipPrefixCommands = ['next', 'n', 'skip', 'jump'];
/**
 * @deprecated
 */
export const skipRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? (skip|next|jump)/gim,
  // Groovy aliases
  /^;(next|n|skip|jump)/gim,
];

export const clearPrefixCommands = ['clear'];
/**
 * @deprecated
 */
export const clearRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? clear/gim,
  // Shortcut
  /^;clear/gim,
];

const debugPrefixCommands = ['debug'];
export const debugPrefixCommandPatterns = debugPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);
