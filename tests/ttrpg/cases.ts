import {
  DieComponentFormatType,
  DieComponentFormat,
} from '../../src/ttrpg/types';

export const expectations = {
  interpretDiceRollRequest: [
    // Negative tests
    {
      input: { diceFormat: '' },
      output: [],
    },
    {
      input: { diceFormat: '2d4d3' },
      output: [],
    },
    {
      input: { diceFormat: '1d5+2d4a2+12' },
      output: [],
    },
    // Positive tests
    {
      input: { diceFormat: '1d6' },
      output: [{ type: 'die', attributes: { d: 6, rolls: 1 } }],
    },
    {
      input: { diceFormat: '1d6+4d20' },
      output: [
        { type: 'die', attributes: { d: 6, rolls: 1 } },
        { type: 'operator', attributes: { value: '+' } },
        { type: 'die', attributes: { d: 20, rolls: 4 } },
      ],
    },
    {
      input: { diceFormat: '1d6+5' },
      output: [
        { type: 'die', attributes: { d: 6, rolls: 1 } },
        { type: 'operator', attributes: { value: '+' } },
        { type: 'const', attributes: { value: 5 } },
      ],
    },
    {
      input: { diceFormat: '2d20 + 1d100 - 4' },
      output: [
        { type: 'die', attributes: { d: 20, rolls: 2 } },
        { type: 'operator', attributes: { value: '+' } },
        { type: 'die', attributes: { d: 100, rolls: 1 } },
        { type: 'operator', attributes: { value: '-' } },
        { type: 'const', attributes: { value: 4 } },
      ],
    },
  ] as {
    input: { diceFormat: string };
    output: DieComponentFormat<DieComponentFormatType>[];
  }[],
};
