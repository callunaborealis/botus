import { expect } from 'chai';
import { interpretDiceRollRequest } from '../../src/ttrpg';
import { DieComponentFormat } from '../../src/ttrpg/types';
import { expectations } from './cases';

describe('TTRPG: Requests processing', () => {
  describe('interpretDiceRollRequest', () => {
    expectations.interpretDiceRollRequest.forEach((expected, i) => {
      const breakdown =
        expected.output.length > 0
          ? expected.output.reduce((acc, val) => {
              switch (val.type) {
                case 'const': {
                  const modifier = (val as DieComponentFormat<'const'>)
                    .attributes.value;
                  return `${acc}${modifier}`;
                }
                case 'die': {
                  const {
                    rolls,
                    d,
                  } = (val as DieComponentFormat<'die'>).attributes;
                  return `${acc}a d${d} die that is rolled ${rolls} times`;
                }
                default: {
                  const operator = (val as DieComponentFormat<'operator'>)
                    .attributes.value;
                  if (operator === '+') {
                    return `${acc} and add it with `;
                  }
                  if (operator === '-') {
                    return `${acc} and subtract it with `;
                  }
                  if (operator === 'x' || operator === '*') {
                    return `${acc} and multiply it with `;
                  }
                  if (operator === '/') {
                    return `${acc} and divide it with `;
                  }
                }
              }
              return acc;
            }, 'break it down to ')
          : 'break it down to nothing';
      it(`should be able to parse "${expected.input.diceFormat}" and ${breakdown}`, () => {
        const processedDiceFormat = interpretDiceRollRequest(
          expected.input.diceFormat,
        );
        expect(JSON.stringify(processedDiceFormat)).to.equal(
          JSON.stringify(expected.output),
        );
      });
    });
  });
});
