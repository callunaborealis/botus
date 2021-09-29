import { expect } from 'chai';
import { identifyRequest, extractRequestDetailsForBot } from '../../src/social';
import { expectations } from './cases';

describe('Social: Requests processing', () => {
  describe('extractRequestDetailsForBot', () => {
    expectations.extractRequestDetailsForBot.forEach((expected) => {
      const wasGreeted = expected.output.greeting !== '';
      describe(`should be able to receive "${expected.input.messageContent}" and`, () => {
        const { greeting, requestStr, style } = extractRequestDetailsForBot(
          expected.input.messageContent,
        );
        it(`know ${
          wasGreeted
            ? `it was greeted with "${expected.output.greeting}"`
            : 'it was not greeted'
        }`, () => {
          expect(greeting).to.equal(expected.output.greeting);
        });
        it(`knows it was asked regarding "${expected.output.requestStr}" from the message`, () => {
          expect(requestStr).to.equal(expected.output.requestStr);
        });
        it(`knows it was asked in the ${expected.output.style} style`, () => {
          expect(style).to.equal(expected.output.style);
        });
      });
    });
  });
  describe('identifyRequest', () => {
    expectations.identifyRequest.forEach((expected) => {
      it(`should ${expected.output.index === -1 ? 'not ' : ''}match "${
        expected.input.messageContent
      }" ${
        expected.input.listOfMatches[expected.output.index]
          ? `with "${expected.input.listOfMatches[expected.output.index]}"`
          : ''
      }`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          expected.input.listOfMatches,
        );
        expect(index).to.equal(expected.output.index);
        expect(matches).to.deep.equal(expected.output.matches);
      });
    });
  });
});
