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

export const loopTrackRequests = [/^;(loop track|ls|lt|loop song)$/gim];
export const loopPlaylistRequests = [/^;(lq|loop queue|lp)$/gim];
export const loopOffRequests = [/^;loop stop$/gim];
export const loopCycleRequests = [/^;l$/gim];
export const setSongVolRequests = [
  // Set vol for current song
  /(^;v) ([\d]+)/gim,
  // Human friendly
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}( (raise|lower|change|set|update|make))( the)?( vol(\.|ume))( (as|at|to|with|using))? ([\d]+)/gim,

  // Set vol for other track (including this one)
  /(^;v)( t| s| track| song)? ([\d]+)( vol(\.|ume))?([\d]+)/gim,
  /(^;v)( vol(\.|ume))?([\d]+)( track| song | t| s)? ([\d]+)/gim,
];
export const removeSongRequests = [/^;rm [\d]+/gim];
export const stopSongRequests = [/^;(stop|leave|fuckoff|goaway)$/gim];
export const resetPlaylistRequests = [
  // Reset
  /^;reset( (\w+)?)?$/gi,
];

export const existingTrackPattern = new RegExp(/([\d]+)/gim);
export const playExistingTrackRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}(play|add)( track| song)? ([\d]+)/gim,
  /(^;p)( track| song)? ([\d]+)/gim,
];

/**
 * Ultimate YouTube link detector. See <https://regexr.com/3akf5>
 */
export const youtubeLinkPattern = new RegExp(
  /((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
);

export const volumeBeingSetPattern = new RegExp(
  /(vol(\.|ume))?( as| at| to| with| using)? (\d)+\.?(\d)?/i,
);

export const playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus ... play/add [youtube link] (natural language processing)
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? [\w\d\s]{0,}(queue|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
  // ;p [youtube link] (shortcut)
  /^;(q|queue|p|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
];

export const listRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? (what[']?s playin[g]?|queue|(play)?list)/gim,
  // Shortcut
  /^;(q|queue|(play)?list)/gim,
];

export const skipRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? (skip|next|jump)/gim,
  // Groovy aliases
  /^;(next|n|skip|jump)/gim,
];

export const clearRequests = [
  /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[,?!]? clear/gim,
  // Shortcut
  /^;clear/gim,
];
