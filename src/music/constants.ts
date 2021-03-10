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
  new RegExp(`(${joinPrefixCommands.join('|')})(?: |$)`),
];
export const joinNaturalRequestExamples = ['join vc', 'join the voice chat'];
export const joinNaturalRequests = [
  'join(?: the)? vc',
  'join(?: the)? voice chat',
].map((v) => new RegExp(v, 'gim'));
/**
 * @deprecated
 */
export const joinVCRequests = [/^;(join|j)$/gim];

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
  new RegExp(`(${loopTrackPrefixCommands.join('|')})(?: |$)`, 'gim'),
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
/**
 * @deprecated
 */
export const loopTrackRequests = [
  /^;(loop ?track|ls|lt|loop ?song|repeat)$/gim,
];
export const loopPlaylistPrefixCommands = ['lq', 'loop queue', 'lp'];
export const loopPlaylistRequests = [/^;(lq|loop queue|lp)$/gim];
export const loopOffPrefixCommands = [
  'loop stop',
  'loopstop',
  'loop off',
  'loopoff',
];
/**
 * @deprecated
 */
export const loopOffRequests = [/^;(loop ?stop|loop ?off)$/gim];
export const loopCyclePrefixCommands = ['l', 'loop'];
/**
 * @deprecated
 */
export const loopCycleRequests = [/^;(l|loop)$/gim];

export const setSongVolPrefixCommands = ['v'];
/**
 * @deprecated
 */
export const setSongVolRequests = [
  // Set vol for current song.
  /(^;v) [\d]+(\.?[\d]+)?/gim,
  // Set vol for current song with track and song
  // Human friendly
  // botus set the volume to 2
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]?([\w\d\s]{0,})?( (raise|lower|change|set|update|make))( the)?( vol(\.|ume)?)( (as|at|to|with|using))? [\d]+(\.?[\d]+)?( |$)/gim,
  // Volume + Song
  /(^;v) [\d]+(\.?[\d]+)? (t|s|track|song) [\d]+( |$)/gim,
  /(^;v) (t|s|track|song) [\d]+ (vol(\.|ume) )?[\d]+(\.?[\d]+)?( |$)/gim,
  // botus raise the volume to 3 for song 2
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]?([\w\d\s]{0,})?( (raise|lower|change|set|update|make))( the)?( vol(\.|ume)?)( (as|at|to|with|using))? [\d]+(\.\d+)?(( (for|with))( (song|track))( [\d]+))([ ?]|$)/gim,
  // botus, for song 2, raise the volume to 3
  /(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]?([\w\d\s]{0,})?(( (for|with))?( (song|track))( [\d]+))[,:-]?( (with|raise|lower|change|set|update|make))?( the)?( vol(\.|ume)?)( (as|at|to|with|using))? [\d]+(\.\d+)?([ ?]|$)/gim,

  // Set vol for other track (including this one)
  /(^;v)( t| s| track| song)? ([\d]+)( vol(\.|ume))?[\d]+(\.\d+)?/gim,
  /(^;v)( vol(\.|ume))?[\d]+(\.\d+)?( track| song | t| s)? ([\d]+)/gim,
];
export const removeSongPrefixCommands = ['rm'];
export const removeSongNaturalKeywords = [
  'remove',
  'take away',
  'delete',
  'throw',
  'get rid of',
  'discard',
  'take out',
  'take away',
];
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
/**
 * @deprecated
 */
export const disconnectVCRequests = [
  /^;(dc|fuck ?off|go ?away|get ?out|kick|leave|reset|bye)( (\w+)?)?$/gi,
];
export const resetPlaylistPrefixCommands = ['forcereset', 'hardreset'];
/**
 * @deprecated
 */
export const resetPlaylistRequests = [
  // Reset
  /^;(forcereset|hardreset)( (\w+)?)?$/gi,
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
 * @deprecated
 */
export const playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus ... play/add [youtube link] (natural language processing)
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}(queue|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
  // ;p [youtube link] (shortcut)
  /^;(q|queue|p|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
];

export const listPrefixCommands = [
  /**
   * /^;(q|queue|(play)?list)(( (pg?|page))?( [\d]+)| ((everything|all)))?( |$)/gim
   */
  'q',
  'queue',
  'play',
  'playlist',
];
/**
 * @deprecated
 */
export const listRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? (what[']?s playin[g]?|queue|(play)?list)( |$)/gim,
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? show(( (pg?|page))?( [\d]+))( |$)/gim,
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? show( (all|all that is|all that'?s|everything))( |$)/gim,
  // Shortcut
  /^;(q|queue|(play)?list)(( (pg?|page))?( [\d]+)| ((everything|all)))?( |$)/gim,
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
