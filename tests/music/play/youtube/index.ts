import { expect } from 'chai';
import { identifyRequest } from '../../../../src/social';
import { playYouTubeLinkPrefixCommandPatterns } from '../../../../src/music/play/youtube/constants';
import { PlayYouTubeLinkPrefixCommandMatches } from '../../../../src/music/play/youtube/types';
import { cases } from './cases';

describe('Music: Play YouTube link', () => {
  describe('identifyRequest', () => {
    [
      ...cases.identifyRequest.prefixCommands.positive,
      ...cases.identifyRequest.prefixCommands.negative,
    ].forEach((expected) => {
      const {
        index,
        matches,
      } = identifyRequest<PlayYouTubeLinkPrefixCommandMatches>(
        expected.input.messageContent,
        playYouTubeLinkPrefixCommandPatterns,
      );

      it(`should ${expected.output.index === -1 ? 'not ' : ''}match "${
        expected.input.messageContent
      }".`, () => {
        expect(index).to.equal(expected.output.index);
      });
      if (expected.output.index !== -1) {
        it(`should know from "${expected.input.messageContent}" to play YouTube link or playlist "${expected.output.link}" at volume ${expected.output.volume}`, () => {
          const actualLink = matches[1] ?? '-';
          expect(actualLink).to.equal(expected.output.link);
          const actualVolume = matches[3] ? parseFloat(matches[3]) : 5;
          expect(actualVolume).to.equal(expected.output.volume);
        });
      }
    });
  });
});
