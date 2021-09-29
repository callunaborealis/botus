import {
  prefixCommandTerminatorPatternStr,
  whitespacePattern,
} from '../../constants';
import { trackTermsPattern } from '../constants';

export const removeTrackPrefixCommands = ['remove', 'rm', 'r'];
export const removeTrackNaturalKeywords = [
  'remove',
  'take away',
  'delete',
  'throw',
  'get rid of',
  'discard',
  'take out',
  'take away',
];
const trackNumberPattern = '[\\d]+';

// /^(?!clear)(?:remove|rm|r)(?:[ ]{1,3}(?:(?:track|song|t|s)[ ]{1,3})?([\d]+))?(?:[ ]{1,}|$)/gim
export const removeTrackPrefixCommandPatterns = [
  new RegExp(
    [
      '^', // Ensure exact matches
      `(?:${removeTrackPrefixCommands.join('|')})`,
      // Optional track nr to remove, if not, remove current track
      `(?:${whitespacePattern}(?:(?:${trackTermsPattern})${whitespacePattern})?(${trackNumberPattern}))?`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
];
