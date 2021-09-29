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
    describe('Positive test cases', () => {
      expectations.identifyRequest.positive.forEach((expected) => {
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
    describe('Negative test cases', () => {
      const clearShouldNotTriggerRm =
        expectations.identifyRequest.negative.clearShouldNotTriggerRm;
      describe('should not just remove the current track when requesting to clear a playlist', () => {
        clearShouldNotTriggerRm.input.messageContents.forEach(
          (messageContent) => {
            describe(`-> "${messageContent}"`, () => {
              const { index, matches } = identifyRequest(
                messageContent,
                clearShouldNotTriggerRm.input.listOfMatches,
              );
              it(`should not have an index for the match`, () => {
                expect(index).to.equal(clearShouldNotTriggerRm.output.index);
              });
              it(`should have no matches`, () => {
                expect(matches).to.deep.equal(
                  clearShouldNotTriggerRm.output.matches,
                );
              });
            });
          },
        );
      });
    });
  });
});
