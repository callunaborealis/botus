import { expect } from 'chai';
import { identifyRequest } from '../../../../src/social';
import { playExistingTrackPrefixCommandPatterns } from '../../../../src/music/play/existing/constants';
import { PlayExistingTrackPrefixCommandMatches } from '../../../../src/music/play/existing/types';
import { cases } from './cases';

describe('Music: Play Existing', () => {
  describe('identifyRequest', () => {
    [
      ...cases.identifyRequest.prefixCommands.positiveMand,
      ...cases.identifyRequest.prefixCommands.positiveOpt,
      ...cases.identifyRequest.prefixCommands.negative,
    ].forEach((expected) => {
      const {
        index,
        matches,
      } = identifyRequest<PlayExistingTrackPrefixCommandMatches>(
        expected.input.messageContent,
        playExistingTrackPrefixCommandPatterns,
      );
      it(`should ${expected.output.index === -1 ? 'not ' : ''}match "${
        expected.input.messageContent
      }".`, () => {
        expect(index).to.equal(expected.output.index);
      });
      if (expected.output.index !== -1) {
        it(`should know from "${expected.input.messageContent}" to play track ${expected.output.track}`, () => {
          const actualTrackNr = parseInt(matches[1] || '', 10);
          expect(actualTrackNr).to.equal(expected.output.track);
        });
      }
    });
  });
});
