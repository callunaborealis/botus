export const existingTrackPattern = new RegExp(/([\d]+)/gim);
export const playExistingTrackOptTrackPrefixCommands = ['p', 'play', 'add'];
export const playExistingTrackMandTrackPrefixCommands = ['q', 'queue'];
const trackPrefixTerms = ['track', 'song'];
const playExistingTrackPrefixCommands = [
  /**
   * /^;(p|play|add)( track| song)? ([\d]+)/gim,
   */
  [
    `(?:${playExistingTrackOptTrackPrefixCommands.join('|')})`,
    `(?: ${trackPrefixTerms.join('|')})?`,
    ' ',
    '([\\d]+)',
  ],
  /**
   * Ensure that it doesn't conflict with list
   * /^;(q|queue) (track|song) ([\d]+)/gim,
   */
  [
    playExistingTrackMandTrackPrefixCommands.join('|'),
    ' ',
    `(?:${trackPrefixTerms.join('|')})`,
    ' ',
    '([\\d]+)',
  ],
];
