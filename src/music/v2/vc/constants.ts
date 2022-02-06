import { prefixCommandTerminatorPatternStr } from '../../../constants';

export const disconnectVCPrefixCommands = [
  'dc',
  'fuckoff',
  'fuck off',
  'goaway',
  'go away',
  'getout',
  'get out',
  'kick',
  'leave',
  'reset',
  'bye',
];

export const disconnectVCPrefixCommandPatterns = disconnectVCPrefixCommands.map(
  (p) => new RegExp(`${p}${prefixCommandTerminatorPatternStr}`, 'gim'),
);
