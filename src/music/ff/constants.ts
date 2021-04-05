import { prefixCommandTerminatorPatternStr } from '../../constants';

export const fastForwardPrefixKeywords = ['fast forward', 'fwd', 'ff'];
const fastForwardPrefixCommands: string[] = [
  `(?:${fastForwardPrefixKeywords
    .map((k) => `(?:${k})`)
    .join('|')})${prefixCommandTerminatorPatternStr}`,
];
export const fastForwardPrefixCommandPatterns = fastForwardPrefixCommands.map(
  (prefixCommand) => new RegExp(prefixCommand, 'gim'),
);
