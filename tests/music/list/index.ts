import { expect } from 'chai';
import { cases } from './cases';
import { generateDisplayedPlaylistPages } from '../../../src/music/list';
import { identifyRequest } from '../../../src/social';
import { showPlaylistPrefixCommandPatterns } from '../../../src/music/list/constants';

describe('List', () => {
  describe('identifyRequest', () => {
    cases.identifyRequests.positive.forEach((expected) => {
      it(`should show the playlist for "${expected}"`, () => {
        const { index } = identifyRequest(
          expected,
          showPlaylistPrefixCommandPatterns,
        );
        expect(index).to.equal(0);
      });
    });
    cases.identifyRequests.negative.forEach((expected) => {
      it(`should not show the playlist when coupled with a YouTube link: "${expected}"`, () => {
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
        it(`should generate generate ${expected.output.pages.length} pages`, () => {
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
