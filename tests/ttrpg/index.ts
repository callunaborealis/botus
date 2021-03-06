import { expect } from 'chai';
import { getDiceFormat } from '../../src/ttrpg';
import { expectations } from './cases';

describe('TTRPG: Requests processing', () => {
  describe('getDiceFormat', () => {
    expectations.getDiceFormat.forEach((expected, i) => {
      it(`should be able to receive "${expected.input.diceFormat}" and standardise it to ${expected.ouput.diceFormat}`, () => {
        const processedDiceFormat = getDiceFormat(expected.input.diceFormat);
        expect(processedDiceFormat).to.equal(expected.ouput.diceFormat);
      });
    });
  });
});
