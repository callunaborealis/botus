import { prefixCommandTerminatorPatternStr } from '../../constants';
import { youtubeLinkPatternStr } from '../constants';

const mandatorySpace = '[ ]{1,3}';
const pageNumberPattern = '[\\d]+';
/**
 * Aliases here should extend Groovy unless contradictions appear
 * @see https://groovy.bot/commands
 */
export const showPlaylistPrefixCommands = [
  /**
   */ // Groovy aliases
  'queue', // Groovy-like alias
  'q', // Groovy-like alias
];

export const pageTerms = ['page', 'pp\\.', 'pp', 'pg', 'p\\.', 'p'];
const pageTermsPattern = pageTerms.join('|');

const showPlaylistPrefixCommandPattern = `(?:${showPlaylistPrefixCommands.join(
  '|',
)})`;

export const showPlaylistPrefixCommandPatterns = [
  new RegExp(
    [
      '^',
      '(?:',
      showPlaylistPrefixCommandPattern,
      ')',
      // To prevent matching with playlist
      `(?!${mandatorySpace}${youtubeLinkPatternStr})`,
      // page 2 | 2 | none
      `(?:${mandatorySpace}(?:(?:${pageTermsPattern})${mandatorySpace})?(${pageNumberPattern})(?:\\.[\\d]+)?)?`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
];
