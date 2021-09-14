import { whitespacePattern } from '../../../constants';
import { BOT_NAME, BOT_PREFIX } from '../../../environment';
import {
  absoluteVolumeSetKeywords,
  optionalVolumeSynonyms as volumeSynonyms,
  volumeLevelPattern,
} from '../../volume/constants';

export const playYoutubeLinkPrefixCommands = ['play', 'add', 'p'];
/**
 * /((?:https?:\/\/)?(?:(?:(?:www.?)?youtube.com(?:\/(?:(?:watch?\S*?(?:v=[^\&\s]+)\S*)|(?:v(?:\S*))|(?:channel\S+)|(?:user\/(\S+))|(?:results?(?:search_query=\S+))))?)|(?:youtu\.be(?:\S*)?)))/gim
 */
export const youtubeLinkPatternStr =
  '(?:https?:\\/\\/)?(?:(?:(?:www\\.?)?youtube.com(?:\\/(?:(?:watch\\?\\S*?(?:v=[^\\&\\s]+)\\S*)|(?:v(?:\\S*))|(?:channel\\S+)|(?:user\\/(\\S+))|(?:results?(?:search_query=\\S+))))?)|(?:youtu\\.be(?:\\S*)?))';
/**
 * @deprecated
 */
export const playYoutubeURLRequests = [
  // hey / hi / sup / hello / yo / oi / oy (optional) BOT_NAME ... play/add [youtube link] (natural language processing)
  // /^(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?BOT_NAME[,?!]? [\w\d\s]{0,}(queue|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
  new RegExp(
    `(([h]?ello |[h]?ey( [h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?${BOT_NAME.toLowerCase()}[,?!]? [\\w\\d\\s]{0,}(queue|play|add) ((?:https?:\\/\\/)?(?:(?:(?:www\\.?)?youtube\\.com(?:\\/(?:(?:watch\\?\\S*?(v=[^&\\s]+)\\S*)|(?:v(\\/\\S*))|(channel\\/\\S+)|(?:user\\/(\\S+))|(?:results\\?(search_query=\\S+))))?)|(?:youtu\\.be(\\/\\S*)?)))`,
    'gim',
  ),
  // ;p [youtube link] (shortcut)
  // /^;(q|queue|p|play|add) ((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
  new RegExp(
    `${BOT_PREFIX}(q|queue|p|play|add) ((?:https?:\\/\\/)?(?:(?:(?:www\\.?)?youtube\\.com(?:\\/(?:(?:watch\\?\\S*?(v=[^&\\s]+)\\S*)|(?:v(\\/\\S*))|(channel\\/\\S+)|(?:user\\/(\\S+))|(?:results\\?(search_query=\\S+))))?)|(?:youtu\\.be(\\/\\S*)?)))`,
    'gim',
  ),
];

export const playYouTubeLinkPrefixCommandPatterns = [
  /**
   * /^;(?:play|add|p) ((?:https?:\\/\\/)?(?:(?:(?:www\\.?)?youtube.com(?:\\/(?:(?:watch\\?\\S*?(?:v=[^\\&\\s]+)\\S*)|(?:v(?:\\S*))|(?:channel\\S+)|(?:user\\/(\\S+))|(?:results?(?:search_query=\\S+))))?)|(?:youtu\\.be(?:\\S*)?)))$/gim,
   *
   * ;play https://www.youtube.com/watch?v=9lrWx7-PiUM
   * ;play https://www.youtube.com/watch?v=9lrWx7-PiUM at vol 2.5
   * ;play https://www.youtube.com/watch?v=9lrWx7-PiUM vol 2.34
   *
   */
  new RegExp(
    [
      `(?:${playYoutubeLinkPrefixCommands.join('|')})`,
      `(?:${whitespacePattern}(${youtubeLinkPatternStr}))`,
      `(?:`,
      `(?:${whitespacePattern}(?:${absoluteVolumeSetKeywords.join('|')}))?`,
      `(?:${whitespacePattern}(?:${volumeSynonyms.join('|')}))`,
      `(?:${whitespacePattern}(${volumeLevelPattern}))`,
      `)?`,
    ].join(''),
    'gim',
  ),
];
