import { expect } from 'chai';
import { identifyRequest, extractRequestDetailsForBot } from '../../src/social';
import { expectations } from './cases';

describe('Social: Requests processing', () => {
  describe('extractRequestDetailsForBot', () => {
    expectations.extractRequestDetailsForBot.forEach((expected) => {
      const wasGreeted = expected.output.greeting !== '';
      it(`should be able to receive "${expected.input.messageContent}", know ${
        wasGreeted
          ? `it was greeted with "${expected.output.greeting}"`
          : 'it was not greeted'
      } and knows it was asked regarding "${
        expected.output.requestStr
      }" from the message`, () => {
        const { greeting, requestStr, style } = extractRequestDetailsForBot(
          expected.input.messageContent,
        );
        expect(greeting).to.equal(expected.output.greeting);
        expect(requestStr).to.equal(expected.output.requestStr);
        expect(style).to.equal(expected.output.style);
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
