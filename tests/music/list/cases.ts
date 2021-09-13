import random from 'lodash/random';
import { v4 as uuidv4 } from 'uuid';

import { songScaffold } from '../../../src/music/constants';
import { LoopType, PlaylistShape, SongShape } from '../../../src/music/types';
import {
  DisplayedPlaylistShape,
  ListPrefixCommandMatches,
} from '../../../src/music/list/types';
import {
  generateNowPlayingTag,
  generateVolumeTag,
  generateDurationTag,
} from '../../../src/music/list';
import { rawTracks } from './constants';
import { pageTerms } from '../../../src/music/list/constants';
import { showPlaylistPrefixCommands } from '../../../src/music/list/constants';

const generateMockTracks = (length: number): SongShape[] => {
  return Array.from({ length }).map((_, i) => {
    return {
      id: uuidv4(),
      title: rawTracks[random(0, rawTracks.length - 1)].title,
      url: rawTracks[random(0, rawTracks.length - 1)].url,
      volume: rawTracks[random(0, rawTracks.length - 1)].volume,
      duration: 0,
    };
  });
};

const generatePlaylist = (tracks: SongShape[], currentTrackIndex: number) => {
  return {
    textChannel: null as any,
    voiceChannel: null,
    connection: null,
    songs: tracks,
    volume: tracks[currentTrackIndex]?.volume ?? 0,
    currentSong: tracks[currentTrackIndex] ?? songScaffold,
    previousSong: songScaffold,
    nextSong: tracks[currentTrackIndex + 1] ?? songScaffold,
    loop: 'off' as LoopType,
    stopOnFinish: false,
    disconnectOnFinish: false,
    isWriteLocked: false,
  };
};

const generateMockPage = (options: {
  tracks: SongShape[];
  currentTrackIndex: number;
  currentPage: number;
  totalPages: number;
}) => {
  const { tracks, currentTrackIndex, currentPage, totalPages } = options;

  return {
    title: 'Default Playlist',
    description:
      totalPages > 1
        ? `Current page: ${1}/${2}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${1} to ${2}}\`.\n`
        : 'Now playing the **default** playlist:',
    fields: [
      ...tracks.map((track, i) => {
        const nowPlayingTag = generateNowPlayingTag({
          currentTrackId: tracks[currentTrackIndex]?.id ?? songScaffold.id,
          iteratedTrackId: track.id,
          nextTrackId: tracks[currentTrackIndex + 1]?.id ?? songScaffold.id,
          playlistLoopType: 'off',
          isLastSong: false,
        });
        const durationTag = generateDurationTag({
          streamTime: 0,
          duration: track.duration,
          isCurrentTrack: track.id === tracks[currentTrackIndex]?.id,
        });
        return {
          name: `1) ${
            nowPlayingTag === '' ? '' : `${nowPlayingTag} | `
          }${durationTag} | ${generateVolumeTag(track.volume)}`,
          value: `${track.title}\n${track.url}`,
        };
      }),
      ...[
        totalPages > 1
          ? {
              name: '\u200b',
              value: `Current page: ${currentPage}/${totalPages}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${currentPage} to ${totalPages}}\`.\n`,
              inline: false,
            }
          : {},
      ],
    ],
  };
};

export const cases = {
  identifyRequests: {
    checkPageNrNaturally: [
      ...[
        'show page 2 of this playlist',
        'show this playlist page 2',
        'show the page 2 of this playlist',
      ].map((input) => {
        return {
          messageContent: input,
          index: 0,
          page: 2,
        };
      }),
      ...[
        'show 2nd page of this playlist',
        'show this playlist 2nd page',
        'show the 2nd page of this playlist',
      ].map((input) => {
        return {
          messageContent: input,
          index: 0,
          page: 2,
        };
      }),
      ...[
        'show all of the playlist',
        'show everything playing',
        'show everything that is playing right now',
      ].map((input) => {
        return {
          messageContent: input,
          index: 1,
          page: 'all',
        };
      }),
      ...['what is playing', 'show what is playing'].map((input) => {
        return {
          messageContent: input,
          index: 2,
          page: 'current',
        };
      }),
    ].map((input) => {
      return {
        input: input,
        output: {
          index: input.index,
        },
      };
    }) as {
      input: {
        messageContent: string;
        index: number;
        page: number | 'current' | 'all';
        pageLocationIndex?: number;
      };
      output: { index: number };
    }[],
    checkPageNr: [
      ...showPlaylistPrefixCommands.map((t) => {
        return {
          messageContent: `${t}`,
          page: undefined,
        };
      }),
      ...showPlaylistPrefixCommands.map((t) => {
        return { messageContent: `${t} 2`, page: 2 };
      }),
      ...showPlaylistPrefixCommands.map((t) => {
        return { messageContent: `${t} ${pageTerms[0]} 3.4`, page: 3 };
      }),
      ...showPlaylistPrefixCommands.map((t) => {
        return {
          messageContent: `${t} ${pageTerms[2]} 12`,
          page: 12,
        };
      }),
      ...showPlaylistPrefixCommands.map((t) => {
        return { messageContent: `${t} p. 100`, page: 100 };
      }),
    ].map((input) => {
      return {
        input,
        output: {
          index: 0,
          matches: [
            '',
            undefined,
            input.page ? `${input.page}` : undefined,
            '',
          ] as ListPrefixCommandMatches[0],
        },
      };
    }),
    negative: showPlaylistPrefixCommands.map((t) => `${t} ${rawTracks[0].url}`),
    negativeNatural: [
      '',
      'play',
      'play https://www.youtube.com/playlist?list=OLAK5uy_m_vU4h8tDdmgf4MOg58Rxx9F4AT82wH1g at vol 3.4',
    ],
  },
  generateDisplayedPlaylistPages: [
    (() => {
      const numberOfTracks = 0;
      const currentTrackIndex = -1;
      const currentPageIndex = -1;
      const tracks = generateMockTracks(numberOfTracks);
      return {
        input: {
          currentTrackIndex,
          numberOfTracks,
          playlist: generatePlaylist(tracks, currentTrackIndex),
        },
        output: {
          currentPageIndex,
          pages: [
            {
              title: 'Default Playlist',
              description: 'Now playing the **default** playlist:',
              fields: [],
            },
          ],
        },
      };
    })(),
    (() => {
      const numberOfTracks = 2;
      const currentTrackIndex = 0;
      const currentPageIndex = 0;
      const tracks = generateMockTracks(numberOfTracks);
      return {
        input: {
          currentTrackIndex,
          numberOfTracks,
          playlist: generatePlaylist(tracks, currentTrackIndex),
        },
        output: {
          currentPageIndex: currentPageIndex,
          pages: [
            generateMockPage({
              tracks,
              currentTrackIndex,
              currentPage: 1,
              totalPages: 1,
            }),
          ],
        },
      };
    })(),
    (() => {
      const numberOfTracks = 7;
      const currentTrackIndex = 0;
      const currentPageIndex = 0;
      const tracks = generateMockTracks(numberOfTracks);
      return {
        input: {
          currentTrackIndex,
          numberOfTracks,
          playlist: generatePlaylist(tracks, currentTrackIndex),
        },
        output: {
          currentPageIndex: currentPageIndex,
          pages: [
            generateMockPage({
              tracks,
              currentTrackIndex,
              currentPage: 1,
              totalPages: 1,
            }),
          ],
        },
      };
    })(),
    (() => {
      const numberOfTracks = [10, 4];
      const currentTrackIndex = 10;
      const currentPageIndex = 1;
      const tracks1 = generateMockTracks(numberOfTracks[0]);
      const tracks2 = generateMockTracks(numberOfTracks[1]);
      return {
        input: {
          currentTrackIndex,
          numberOfTracks: numberOfTracks[0] + numberOfTracks[1],
          playlist: generatePlaylist(
            [...tracks1, ...tracks2],
            currentTrackIndex,
          ),
        },
        output: {
          currentPageIndex,
          pages: [
            generateMockPage({
              tracks: tracks1,
              currentTrackIndex,
              currentPage: 1,
              totalPages: 2,
            }),
            generateMockPage({
              tracks: tracks1,
              currentTrackIndex,
              currentPage: 2,
              totalPages: 2,
            }),
          ],
        },
      };
    })(),
    (() => {
      const numberOfTracks = [10, 4];
      const currentTrackIndex = 0;
      const currentPageIndex = 0;
      const tracks1 = generateMockTracks(numberOfTracks[0]);
      const tracks2 = generateMockTracks(numberOfTracks[1]);
      return {
        input: {
          currentTrackIndex,
          numberOfTracks: numberOfTracks[0] + numberOfTracks[1],
          playlist: generatePlaylist(
            [...tracks1, ...tracks2],
            currentTrackIndex,
          ),
        },
        output: {
          currentPageIndex,
          pages: [
            generateMockPage({
              tracks: tracks1,
              currentTrackIndex,
              currentPage: 1,
              totalPages: 2,
            }),
            generateMockPage({
              tracks: tracks1,
              currentTrackIndex,
              currentPage: 2,
              totalPages: 2,
            }),
          ],
        },
      };
    })(),
    (() => {
      const numberOfTracks = [10, 10, 5];
      const currentTrackIndex = 20;
      const currentPageIndex = 2;
      const tracks = numberOfTracks.map((t) =>
        generateMockTracks(numberOfTracks[0]),
      );
      return {
        input: {
          currentTrackIndex,
          numberOfTracks:
            numberOfTracks[0] + numberOfTracks[1] + numberOfTracks[2],
          playlist: generatePlaylist(
            [...tracks[0], ...tracks[1], ...tracks[2]],
            currentTrackIndex,
          ),
        },
        output: {
          currentPageIndex,
          pages: [
            generateMockPage({
              tracks: tracks[0],
              currentTrackIndex,
              currentPage: 1,
              totalPages: numberOfTracks.length,
            }),
            generateMockPage({
              tracks: tracks[1],
              currentTrackIndex,
              currentPage: 2,
              totalPages: numberOfTracks.length,
            }),
            generateMockPage({
              tracks: tracks[2],
              currentTrackIndex,
              currentPage: 3,
              totalPages: numberOfTracks.length,
            }),
          ],
        },
      };
    })(),
  ] as {
    input: {
      currentTrackIndex: number;
      numberOfTracks: number;
      playlist: PlaylistShape;
    };
    output: DisplayedPlaylistShape;
  }[],
};
