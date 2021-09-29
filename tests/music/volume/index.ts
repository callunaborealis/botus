import { expect } from 'chai';
import { extractNaturalSetVolumeDetails } from '../../../src/music/volume';
import { setSongVolNaturalRequestPatterns } from '../../../src/music/volume/constants';
import { identifyRequest } from '../../../src/social';
import { setVolumeCases } from './cases';

const lengthOfPrefixCommandMatches = 4;
const lengthOfNaturalReqMatches = [12];

describe('Music: Volume', () => {
  describe('identifyRequests', () => {
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
  });
  describe('extractNaturalSetVolumeDetails', () => {
    setVolumeCases.extractNaturalSetVolumeDetails.forEach((expected) => {
      describe(`should be able to receive "${expected.input.messageContent}" and...`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          setSongVolNaturalRequestPatterns,
        );
        it('returns all matches back correctly', () => {
          expect(matches.length).to.equal(lengthOfNaturalReqMatches[0]);
        });

        const actualOutput = extractNaturalSetVolumeDetails({ index, matches });

        it(`detects the playlist correctly as ${expected.output.playlist}`, () => {
          expect(actualOutput.playlist).to.equal(expected.output.playlist);
        });
        it(`detects the track correctly as ${expected.output.track}`, () => {
          expect(actualOutput.track).to.equal(expected.output.track);
        });
        it(`detects the volume action correctly as ${expected.output.volAction}`, () => {
          expect(actualOutput.volAction).to.equal(expected.output.volAction);
        });
        it(`detects the volume action type correctly as ${expected.output.volActionType}`, () => {
          expect(actualOutput.volActionType).to.equal(
            expected.output.volActionType,
          );
        });
        it(`detects the volume action verb correctly as ${expected.output.volActionVerb}`, () => {
          expect(actualOutput.volActionVerb).to.equal(
            expected.output.volActionVerb,
          );
        });
        it(`detects the volume level correctly as ${expected.output.volume}`, () => {
          expect(actualOutput.volume).to.equal(expected.output.volume);
        });
        it(`detects the volume type correctly as ${expected.output.volumeType}`, () => {
          expect(actualOutput.volumeType).to.equal(expected.output.volumeType);
        });
      });
    });
  });
});
