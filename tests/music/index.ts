import { expect } from 'chai';
import { getYoutubeLinkAndVolFromRequest } from '../../src/music/helper';
import { expectedInputs, expectedOutputs } from './cases';

describe('Music: Requests processing', () => {
  describe('music getYoutubeLinkAndVolFromRequest', () => {
    expectedInputs.getYoutubeLinkAndVolFromRequest.forEach(
      (expectedInput, i) => {
        const expected = expectedOutputs.getYoutubeLinkAndVolFromRequest[i];
        it(`should be able to receive "${
          expectedInput.request
        }" and figure out that the YouTube link is "${
          expected.link
        }", volume is "${expected.volume}" as max volume of ${
          expectedInput.maxAllowableVolume
        } ${expected.maxAllowableReached ? '' : 'not'} reached`, () => {
          const actual = getYoutubeLinkAndVolFromRequest(
            expectedInput.request,
            expectedInput.maxAllowableVolume,
          );
          expect(actual.link).to.equal(expected.link);
          expect(actual.playlistId).to.equal(expected.playlistId);
          expect(actual.maxAllowableReached).to.equal(
            expected.maxAllowableReached,
          );
          expect(actual.volume).to.equal(expected.volume);
        });
      },
    );
  });
});
