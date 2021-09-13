export { BOT_PREFIX } from './environment';

export const THEME_COLOUR = '#8a0a29';

// Pattern matching components
export const prefixCommandTerminatorPatternStr = '(?:[ ]{1,}|$)';
export const naturalRequestTerminatorPatternStr = '(?: |[?!.,]|$)';
export const whitespacePattern = '[ ]{1,3}';
export const askingForPermissionPattern = [
  `(?:`,
  whitespacePattern,
  `(?:`,
  [
    '(?:can|will) you',
    'are you able to',
    '(?:pretty )?please',
    '(?:fucking? )?go(?: (?:ahead|forth)(?: and|, )?)',
  ]
    .map((p) => `(?:${p})`)
    .join('|'),
  `)`,
  `)?`,
].join('');
