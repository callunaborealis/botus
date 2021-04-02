import { whitespacePattern } from '../../../constants';

const trackNrPatternStr = '[\\d]+';
/**
 * Prefixes that MUST have a track prefix (`e.g. ;q track 2`) as
 * `;q 2` is reserved for opening page 2.
 */
export const playExistingTrackOptTrackPrefixCommands = [
  'p',
  'play',
  // Groovy aliases
  'jump',
  'j',
  'goto',
];
/**
 * Prefixes that MAY have a track prefix (`e.g. ;q track 2`) as
 * `;q 2` is reserved for opening page 2.
 */
export const playExistingTrackMandTrackPrefixCommands = ['q', 'queue'];
const trackPrefixTerms = ['track', 'song'];
const playExistingTrackPrefixCommands = [
  /**
   * /^;(p|play|jump|goto|j)( track| song)? ([\d]+)/gim,
   */
  [
    `(?:${playExistingTrackOptTrackPrefixCommands.join('|')})`,
    `(?:${whitespacePattern}(?:${trackPrefixTerms.join('|')}))?`,
    `(?:${whitespacePattern}(${trackNrPatternStr}))`,
  ],
  /**
   * Ensure that it doesn't conflict with list
   * /^;(q|queue) (track|song) ([\d]+)/gim,
   */
  [
    `(?:${playExistingTrackMandTrackPrefixCommands.join('|')})`,
    `(?:${whitespacePattern}(?:${trackPrefixTerms.join('|')}))`,
    `(?:${whitespacePattern}(${trackNrPatternStr}))`,
  ],
];

export const playExistingTrackPrefixCommandPatterns = playExistingTrackPrefixCommands.map(
  (prefixCommand) => new RegExp(prefixCommand.join(''), 'gim'),
);
