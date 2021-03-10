import { OperatorFormat } from './types';

export const rollDicePrefixCommands = ['roll'];
export const rollDiceNaturalRequests = rollDicePrefixCommands;
const integer = '\\d+';
const optionalSpace = ' ?';
export const optionalOperatorParts: OperatorFormat[] = [
  '+',
  '-',
  '*',
  'x',
  '/',
];
const rollDieFormatParts = [
  // Number of rolls
  `(${integer})`,
  optionalSpace,
  'd',
  optionalSpace,
  // Number of faces
  `(${integer})`,
];
export const dieComponentParts = [
  '(?:(?:',
  ...rollDieFormatParts,
  optionalSpace,
  ')|(?:',
  // Constant value
  `(${integer})`,
  '))',
];
export const operatorComponentParts = [
  // Operator constant
  optionalSpace,
  `(${optionalOperatorParts.map((op) => `\\${op}`).join('|')})`,
  optionalSpace,
];

// /roll ((?:(?:(?:(\d+) ?d ?(\d+) ?)|(?:(\d+))))(?: ?(\+|\-|\*|\x|\/) ?(?:(?:(?:(\d+) ?d ?(\d+) ?)|(?:(\d+))))){0,})/gim
const fullDicePattern = `(?:${dieComponentParts.join(
  '',
)})(?:${operatorComponentParts.join('')}(?:${dieComponentParts.join('')})){0,}`;

export const rollDicePrefixPatterns = rollDicePrefixCommands.map(
  (cmd) => new RegExp(`${cmd} (${fullDicePattern})`, 'gim'),
);
