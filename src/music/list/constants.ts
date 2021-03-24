import {
  askingForPermissionPattern,
  whitespacePattern,
  prefixCommandTerminatorPatternStr,
  naturalRequestTerminatorPatternStr,
} from '../../constants';
import { youtubeLinkPatternStr } from '../play/youtube/constants';

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
      `(?!${whitespacePattern}(?:${youtubeLinkPatternStr}))`,
      // page 2 | 2 | none
      `(?:${whitespacePattern}(?:(?:${pageTermsPattern})${whitespacePattern})?(${pageNumberPattern})(?:\\.[\\d]+)?)?`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
];

// Natural Language Request processing

const trackVariants = ['song', 'track'];
const whatIsVariants = ['what is', "what\\'s"];
const whatAreVariants = ['what are', "what're"];
const rightNowVariants = ['right now', 'at the moment', 'now', 'here'];

// "of / in" in "of the playlist"
const ofPrefixVariants = ['of', 'for', 'in', 'inside', 'within'];
const ofPrefixPattern = ofPrefixVariants.join('|');
// "the playlist" / "this playlist"
const thePlaylistPattern = `(?:(?:the|this)?${whitespacePattern})playlist`;

const whatPlayingRequests = [
  // what is playing
  `(?:${whatIsVariants.join(
    '|',
  )})${whitespacePattern}playing(?:${whitespacePattern}(?:${rightNowVariants.join(
    '|',
  )}))?`,
  // what are you playing right now
  `(?:${whatAreVariants.join(
    '|',
  )})${whitespacePattern}you${whitespacePattern}playing(?:${whitespacePattern}(?:${rightNowVariants.join(
    '|',
  )}))?`,
  // what is this song
  `(?:${whatIsVariants.join(
    '|',
  )})${whitespacePattern}this${whitespacePattern}(?:${trackVariants.join(
    '|',
  )})`,
];
const whatPlayingRequestPattern = whatPlayingRequests
  .map((p) => `(?:${p})`)
  .join('|');
const showPlayingRequests = [
  // show the playlist
  `show${whitespacePattern}(?:${thePlaylistPattern})`,
  // show what is playing
  `show${whitespacePattern}what${whitespacePattern}is${whitespacePattern}playing`,
];
const showPlayingRequestPattern = showPlayingRequests
  .map((p) => `(?:${p})`)
  .join('|');

const pageNrPatterns = [
  // page 2
  `(?:${pageTermsPattern})${whitespacePattern}(${pageNumberPattern})`,
  // 2nd page
  `(${pageNumberPattern})(?:st|nd|rd|th)${whitespacePattern}(?:${pageTermsPattern})`,
];
const pageNrPatternGroup = pageNrPatterns.map((p) => `(?:${p})`).join('|');

const showPageNrOfPlaylist = [
  // show page 2 of this playlist
  `show${whitespacePattern}(?:${pageNrPatternGroup})${whitespacePattern}(?:${ofPrefixPattern})${whitespacePattern}(?:${thePlaylistPattern})`,
  // show this playlist page 2
  `show${whitespacePattern}(?:${thePlaylistPattern})${whitespacePattern}(?:${pageNrPatternGroup})`,
  // show the page 2 of this playlist
  `show${whitespacePattern}(?:the${whitespacePattern})?(?:${pageNrPatternGroup})${whitespacePattern}(?:${ofPrefixPattern})${whitespacePattern}(?:${thePlaylistPattern})`,
];
const showPageNrOfPlaylistPattern = showPageNrOfPlaylist
  .map((p) => `(?:${p})`)
  .join('|');

// Show everything...
const thatIsPlayingVariants = [
  'playing',
  'that is playing',
  'that will play',
  'that will be played',
  'that is gonna play',
];

const showAllRequests = [
  // show all of the playlist
  `show${whitespacePattern}all${whitespacePattern}of${whitespacePattern}the${whitespacePattern}playlist`,
  // show everything playing
  `show${whitespacePattern}everything${whitespacePattern}(?:${thatIsPlayingVariants.join(
    '|',
  )})`,
  // show what is playing
  `show${whitespacePattern}all${whitespacePattern}of${whitespacePattern}(?:${whatPlayingRequestPattern})`,
  // show all the playlist tracks
  `show${whitespacePattern}all${whitespacePattern}the${whitespacePattern}playlist${whitespacePattern}(?:${trackVariants.join(
    '|',
  )})`,
];
const showAllRequestPattern = showAllRequests.map((p) => `(?:${p})`).join('|');

export const showPlaylistNaturalRequestPatterns = [
  new RegExp(
    [
      '(?:',
      '(?:',
      // optional "Are you able to"
      `(?:${askingForPermissionPattern}${whitespacePattern})?`,
      // "show the playlist / show what is playing"
      `(?:${showPageNrOfPlaylistPattern})`,
      ')',
      naturalRequestTerminatorPatternStr,
      ')',
    ].join(''),
    'gim',
  ),
  // show all of the playlist / show everything playing - show all pages at once
  new RegExp(
    [
      '(?:',
      '(?:',
      // optional "Are you able to"
      `(?:${askingForPermissionPattern}${whitespacePattern})?`,
      // "show all of the playlist / show everything playing"
      `(?:${showAllRequestPattern})`,
      ')',
      naturalRequestTerminatorPatternStr,
      ')',
    ].join(''),
    'gim',
  ), // what is playing / show playlist - no page number specified
  new RegExp(
    [
      '(?:',
      '(?:',
      // optional "Are you able to"
      `(?:${askingForPermissionPattern}${whitespacePattern})?`,
      // "show the playlist / show what is playing"
      `(?:(?:${whatPlayingRequestPattern})|(?:${showPlayingRequestPattern}))`,
      ')',
      // don't capture page suffix
      `(?!${whitespacePattern}(?!${showPageNrOfPlaylistPattern}))`,
      naturalRequestTerminatorPatternStr,
      ')',
    ].join(''),
    'gim',
  ),
];
