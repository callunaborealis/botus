import { expect } from 'chai';
import { cases } from './cases';
import { generateDisplayedPlaylistPages } from '../../../src/music/list';

describe('List', () => {
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
