import { LoopType, PlaylistShape, SongShape } from './types';

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

/**
 * Ultimate YouTube link detector. See <https://regexr.com/3akf5>
 */
export const youtubeLinkPattern = new RegExp(
  /(?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
);

export const volumeBeingSetPattern = new RegExp(
  /vol(ume)?( as| at| to)? (\d)+/i,
);

export const playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) botus ... play/add [youtube link] (natural language processing)
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? [\w\d\s]{0,}(play|add) (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
  // ;p [youtube link] (shortcut)
  /^;(p|play|add) (?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?))/gim,
];

export const listRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? (what[']?s playin[g]?|queue|(play)?list)/gim,
  // Shortcut
  /^;(q|queue|(play)?list)/gim,
];

export const skipRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? (skip|next|jump)/gim,
  // Groovy aliases
  /^;(next|n|skip|jump)/gim,
];

export const clearRequests = [
  /^([h]?ello |[h]?ey |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] )?botus[,?!]? (leave|stop|clear|pack it up|clear up|stop and clear|party's over)/gim,
  // Shortcut
  /^;clear/gim,
];
