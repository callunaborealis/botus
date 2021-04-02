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
