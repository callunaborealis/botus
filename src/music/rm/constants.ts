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
export const removeTrackPrefixCommandPatterns = [
  new RegExp(
    [
      `(?:${removeTrackPrefixCommands.join('|')})`,
      // Optional track nr to remove, if not, remove current track
      `(?:${whitespacePattern}(?:(?:${trackTermsPattern})${whitespacePattern})?(${trackNumberPattern}))?`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
];
