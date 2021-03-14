import {
  askingForPermissionPattern,
  whitespacePattern,
  prefixCommandTerminatorPatternStr,
} from '../../constants';
import { trackTermsPattern } from '../constants';

const trackNumberPattern = '[\\d]+';
const volumeLevelPattern = '[\\d]+(?:(?:\\.)[\\d]+)?';
const optionalVolumeSynonyms = ['volume', 'vol'];

export const setSongVolPrefixCommands = ['v'];
export const setSongVolPrefixCommandPatterns = [
  // ;v track 2 vol 2
  new RegExp(
    [
      `(?:${setSongVolPrefixCommands.join('|')})`,
      whitespacePattern,
      // Volume nr
      `(?:(?:(?:${optionalVolumeSynonyms.join(
        '|',
      )})${whitespacePattern})?(${volumeLevelPattern}))`,
      // track nr
      `(?:${whitespacePattern}(?:${trackTermsPattern})${whitespacePattern}(${trackNumberPattern}))?`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
  new RegExp(
    [
      `(?:${setSongVolPrefixCommands.join('|')})`,
      whitespacePattern,
      // advance track nr
      `(?:(?:${trackTermsPattern})${whitespacePattern}(${trackNumberPattern}))?`,
      // Volume nr
      `(?:${whitespacePattern}(?:(?:${optionalVolumeSynonyms.join(
        '|',
      )})?${whitespacePattern})(${volumeLevelPattern}))`,
      prefixCommandTerminatorPatternStr,
    ].join(''),
    'gim',
  ),
];

// https://www.classicthesaurus.com/turning_up_the_volume/synonyms
// xx volume
const volumeSynonyms = ['(?:(?:the|le|da|la|de) )?volume'];
const upPrefixTermsVolumeSynonyms = [
  'bring up(?: to)?',
  'boost(?: to)?',
  'crank up(?: to)?',
  'increase(?: to)?',
  'louden(?: to)?',
  'pump up(?: to)?',
  'raise(?: to)?',
  'turn up(?: to)?',
  'up(?: to)?',
];
// xx volume yy
const upSandwichTermsVolumeSynonyms = [
  ['raise', '(?:way )?up'],
  ['turn', '(?:way )?up'],
  ['pump', '(?:way )?up'],
  ['crank', '(?:way )?up'],
  ['bring', '(?:way )?up'],
  ['boost', '(?:way )?up'],
  ['set', '(?:way )?up'],
  ['make', '(?:way )?louder'],
];
// volume yy
const downPrefixTermsVolumeSynonyms = [
  'bring down',
  'crank down',
  'decrease',
  'drop',
  'down',
  'lower',
  'pipe down',
  'pump down',
  'reduce',
  'soften',
  'turn down',
];
// xx volume yy
const downSandwichTermsVolumeSynonyms = [
  ['bring', '(?:way )?down'],
  ['crank', '(?:way )?down'],
  ['drop', '(?:way )?down'],
  ['lower', '(?:way )?down'],
  ['make', '(?:way )?softer'],
  ['pipe', '(?:way )?down'],
  ['pump', '(?:way )?down'],
  ['reduce', '(?:way )?down'],
  ['set', '(?:way )?(down|softer)'],
  ['soften', '(?:way )?softer'],
  ['turn', '(?:way )?down'],
];
const neutralPrefixTermsVolumeSynonyms = [
  'adjust(?: to)?',
  'alter(?: to)?',
  'change(?: to)?',
  'make(?: to)?',
  'modify(?: to)?',
  'set(?: to)?',
  'tweak(?: to)?',
  'update(?: to)?',
];
const absoluteVolumeSetKeywords = [
  'as',
  'at',
  'to',
  'until',
  'til',
  'using',
  'with',
  'using',
];
const relativeVolumeSetKeywords = ['by', 'plus', 'minus'];

const volumePattern = volumeSynonyms.map((p) => `(?:${p})`).join('|');
const upPrefixTermVolumePattern = upPrefixTermsVolumeSynonyms
  .map((p) => `(?:(?:${p})${whitespacePattern}(?:${volumePattern}))`)
  .join('|');
const upSandwichTermsVolumePattern = upSandwichTermsVolumeSynonyms
  .map(
    ([p, s]) =>
      `(?:${p}${whitespacePattern}(?:${volumePattern})${whitespacePattern}${s})`,
  )
  .join('|');

const downPrefixTermVolumePattern = downPrefixTermsVolumeSynonyms
  .map((p) => `(?:(?:${p})${whitespacePattern}(?:${volumePattern}))`)
  .join('|');
const downSandwichTermsVolumePattern = downSandwichTermsVolumeSynonyms
  .map(
    ([p, s]) =>
      `(?:${p}${whitespacePattern}${volumePattern}${whitespacePattern}${s})`,
  )
  .join('|');

const neutralPrefixTermsVolumePattern = neutralPrefixTermsVolumeSynonyms
  .map((p) => `(?:(?:${p})${whitespacePattern}(?:${volumePattern}))`)
  .join('|');
const absoluteVolumeSetPattern = absoluteVolumeSetKeywords.join('|');
const relativeVolumeSetPattern = relativeVolumeSetKeywords.join('|');

const trackPrefixTermPattern = '(?:for)';
const trackNrPattern = [
  // for track 4
  `(?:${trackTermsPattern}) (${trackNumberPattern})`,
  // for the 4th track
  `(?:the )?(${trackNumberPattern})(?:st|nd|rd|th) (?:${trackTermsPattern})`,
]
  .map((p) => `(?:${p})`)
  .join('|');

export const setSongVolNaturalRequestPatterns = [
  // set volume to 4 for track 1
  new RegExp(
    [
      '(?:',
      '(?:',
      // optional "Are you able to"
      `(?:${askingForPermissionPattern}${whitespacePattern})?`,
      // "set the volume"
      '(?:',
      `(${upPrefixTermVolumePattern})`,
      '|',
      `(${upSandwichTermsVolumePattern})`,
      '|',
      `(${downPrefixTermVolumePattern})`,
      '|',
      `(${downSandwichTermsVolumePattern})`,
      '|',
      `(${neutralPrefixTermsVolumePattern})`,
      ')',
      whitespacePattern,
      ')',
      // volume 2.45
      `(?:(?:(${absoluteVolumeSetPattern})|(${relativeVolumeSetPattern}))${whitespacePattern})?`,
      `(${volumeLevelPattern})`,
      // "for track 3"
      `(?:${whitespacePattern}(?:(?:${trackPrefixTermPattern})${whitespacePattern}(?:${trackNrPattern})))?`,
      ')',
    ].join(''),
    'gim',
  ),
  // TODO: for track 1, set volume to 4
  // TODO: set track 1 volume to 4 / make track 1 volume softer by 2
];
