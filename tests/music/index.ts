import { expect } from 'chai';
import { getYoutubeLinkAndVolFromRequest } from '../../src/music/helper';
import { expectations, expectedInputs, expectedOutputs } from './cases';
import { identifyRequest } from '../../src/social';
import { getTrackNrFromRmSongCommand } from '../../src/music/rm';
import { removeTrackPrefixCommandPatterns } from '../../src/music/rm/constants';
import { RemoveTrackMatchPatterns } from '../../src/music/rm/types';
describe('Music: Requests processing', () => {
  describe('getYoutubeLinkAndVolFromRequest', () => {
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
  describe('identifyRequest', () => {
    expectations.identifyRequest.rm.forEach((expected, i) => {
      it(`should remove ${
        expected.output.trackNr === 'current'
          ? 'the current song'
          : `song ${expected.output.trackNr}`
      } for "${expected.input}"`, () => {
        const actual = identifyRequest<RemoveTrackMatchPatterns[0]>(
          expected.input,
          removeTrackPrefixCommandPatterns,
        );
        const actualTrackNr = getTrackNrFromRmSongCommand(actual.matches);
        expect(actual.index).to.equal(expected.output.index);
        expect(actual.matches).to.deep.equal(expected.output.matches);
        expect(actualTrackNr).to.equal(expected.output.trackNr);
      });
    });
  });
});
