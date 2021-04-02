import { expect } from 'chai';
import { cases } from './cases';
import { generateDisplayedPlaylistPages } from '../../../src/music/list';
import { identifyRequest } from '../../../src/social';
import {
  showPlaylistNaturalRequestPatterns,
  showPlaylistPrefixCommandPatterns,
} from '../../../src/music/list/constants';
import { getPageNrFromNaturalRequestMatches } from '../../../src/music/list/helper';

describe('List', () => {
  describe('identifyRequest', () => {
    cases.identifyRequests.checkPageNrNaturally.forEach((expected) => {
      const theExpectedPage = (() => {
        if (expected.input.page === 'current') {
          return 'the current page';
        }
        if (expected.input.page === 'all') {
          return 'all pages';
        }
        return expected.input.page;
      })();
      it(`should extract ${theExpectedPage} from "${expected.input.messageContent}"`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          showPlaylistNaturalRequestPatterns,
        );
        const actualPage = getPageNrFromNaturalRequestMatches(index, matches);
        expect(index).to.equal(expected.output.index);
        expect(actualPage).to.deep.equal(expected.input.page);
        if (index === 0) {
          expect(matches.length).to.equal(8);
        }
      });
    });
    cases.identifyRequests.negativeNatural.forEach((expected) => {
      it(`should not show the playlist when "${expected}"`, () => {
        const { index } = identifyRequest(
          expected,
          showPlaylistNaturalRequestPatterns,
        );
        expect(index).to.equal(-1);
      });
    });
    cases.identifyRequests.checkPageNr.forEach((expected) => {
      it(`should extract ${
        expected.input.page ? `page ${expected.input.page}` : 'no page'
      } from "${expected.input.messageContent}"`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          showPlaylistPrefixCommandPatterns,
        );
        expect(index).to.equal(expected.output.index);
        expect(matches).to.deep.equal(expected.output.matches);
      });
    });
    cases.identifyRequests.checkPageNr.forEach((expected) => {
      it(`should extract ${
        expected.input.page ? `page ${expected.input.page}` : 'no page'
      } from "${expected.input.messageContent}"`, () => {
        const { index, matches } = identifyRequest(
          expected.input.messageContent,
          showPlaylistPrefixCommandPatterns,
        );
        expect(index).to.equal(expected.output.index);
        expect(matches).to.deep.equal(expected.output.matches);
      });
    });
    cases.identifyRequests.negative.forEach((expected) => {
      it(`should not show the playlist when the command is coupled with a YouTube link: "${expected}"`, () => {
        const { index } = identifyRequest(
          expected,
          showPlaylistPrefixCommandPatterns,
        );
        expect(index).to.equal(-1);
      });
    });
  });
  describe('generateDisplayedPlaylistPages', () => {
    cases.generateDisplayedPlaylistPages.forEach((expected, i) => {
      describe(`For a playlist of a total size of ${expected.input.numberOfTracks} tracks`, () => {
        const { currentPageIndex, pages } = generateDisplayedPlaylistPages({
          playlist: expected.input.playlist,
          streamTime: 0,
        });
        it(`should know that track ${
          expected.input.currentTrackIndex + 1
        } is on page ${expected.output.currentPageIndex + 1} of ${
          pages.length
        }`, () => {
          expect(currentPageIndex + 1).to.equal(
            expected.output.currentPageIndex + 1,
          );
        });
        it(`should generate ${expected.output.pages.length} pages`, () => {
          expect(pages.length).to.equal(expected.output.pages.length);
        });
        it(`should generate all track details into pages when asked for it`, () => {
          if (pages[0]) {
            expect(pages[0].title).to.equal(expected.output.pages[0].title);
          }
          if (pages[0]?.fields?.[0]) {
            expect(pages[0].fields?.[0].name).to.equal(
              expected.output.pages[0].fields?.[0].name,
            );
          }
        });
      });
    });
  });
});
