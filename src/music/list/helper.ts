import { ExtractedPlaylistPageType } from './types';

export const getPageNrFromNaturalRequestMatches = (
  index: number,
  matches: (string | undefined)[],
): ExtractedPlaylistPageType => {
  if (index === 1) {
    return 'all';
  }
  if (index === 0 && matches.length === 8) {
    return matches.reduce(
      (
        eventualActualPage: ExtractedPlaylistPageType,
        match: string | undefined,
      ) => {
        if (!match) {
          return eventualActualPage;
        }
        const pageCandidate = parseInt(match, 10);
        if (isFinite(pageCandidate)) {
          return pageCandidate;
        }
        return eventualActualPage;
      },
      'current',
    );
  }
  return 'current';
};
