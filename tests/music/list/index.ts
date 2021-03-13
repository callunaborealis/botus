import { expect } from 'chai';
import { cases } from './cases';
import { generateDisplayedPlaylistPages } from '../../../src/music/list';

describe('List', () => {
  describe('generateDisplayedPlaylistPages', () => {
    cases.generateDisplayedPlaylistPages.forEach((expected, i) => {
      it(`should generate all track details into pages when asked for it`, () => {
        const { currentPageIndex, pages } = generateDisplayedPlaylistPages({
          playlist: expected.input.playlist,
        });
        console.log(JSON.stringify({ currentPageIndex, pages }));

        expect(currentPageIndex).to.equal(expected.output.currentPageIndex);
        expect(pages.length).to.equal(expected.output.pages.length);
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
