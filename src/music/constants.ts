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
