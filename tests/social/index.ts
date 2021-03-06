import { expect } from 'chai';
import { extractRequestDetailsForBot } from '../../src/social';
import { expectations } from './cases';

describe('Social: Requests processing', () => {
  describe('extractRequestDetailsForBot', () => {
    expectations.extractRequestDetailsForBot.forEach((expected) => {
      const wasGreeted = expected.output.greeting !== '';
      it(`should be able to receive "${expected.input.messageContent}", know ${
        wasGreeted
          ? `it was greeted with "${expected.output.greeting}"`
          : 'it was not greeted'
      } and extract "${expected.output.requestStr}" from the message`, () => {
        const { greeting, requestStr, style } = extractRequestDetailsForBot(
          expected.input.messageContent,
        );
        expect(greeting).to.equal(expected.output.greeting);
        expect(requestStr).to.equal(expected.output.requestStr);
        expect(style).to.equal(expected.output.style);
      });
    });
  });
});
