import { expect } from 'chai';
import { getYoutubeLinkAndVolFromRequest } from '../../src/music/helper';
import { extractNaturalSetVolumeDetails } from '../../src/music/volume';
import { setSongVolNaturalRequestPatterns } from '../../src/music/volume/constants';
import { identifyRequest } from '../../src/social';
import { expectedInputs, expectedOutputs, setVolumeCases } from './cases';

const lengthOfPrefixCommandMatches = 4;
const lengthOfNaturalReqMatches = [13];

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
  describe('Volume', () => {
    setVolumeCases.identifyRequests.forEach((expected) => {
      it(`should ${expected.output.index === -1 ? 'not ' : ''}match "${
        expected.input.messageContent
      }" and send out [${expected.output.matches.join(',')}]`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          expected.input.listOfMatches,
        );
        expect(index).to.equal(expected.output.index);
        expect(matches).to.deep.equal(expected.output.matches);
        expect(matches.length).to.oneOf([
          lengthOfPrefixCommandMatches,
          lengthOfNaturalReqMatches[0],
        ]);
      });
    });
    setVolumeCases.extractNaturalSetVolumeDetails.forEach((expected) => {
      it(`should be able to receive "${
        expected.input.messageContent
      }" and set the volume to ${expected.output.volume} for ${
        expected.output.track === 'current'
          ? 'the current track'
          : expected.output.track
      } for the "${expected.output.playlist}" playlist, know that "${
        expected.output.volActionVerb
      }" is a ${
        expected.output.volAction
      } type of volume setting action `, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          setSongVolNaturalRequestPatterns,
        );
        expect(matches.length).to.equal(lengthOfNaturalReqMatches[0]);

        const actualOutput = extractNaturalSetVolumeDetails({ index, matches });
        expect(actualOutput.playlist).to.equal(expected.output.playlist);
        expect(actualOutput.track).to.equal(expected.output.track);
        expect(actualOutput.volAction).to.equal(expected.output.volAction);
        expect(actualOutput.volActionType).to.equal(
          expected.output.volActionType,
        );
        expect(actualOutput.volActionVerb).to.equal(
          expected.output.volActionVerb,
        );
        expect(actualOutput.volume).to.equal(expected.output.volume);
        expect(actualOutput.volumeType).to.equal(expected.output.volumeType);
      });
    });
  });
});
