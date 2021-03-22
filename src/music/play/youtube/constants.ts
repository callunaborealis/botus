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
