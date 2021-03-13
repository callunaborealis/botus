import random from 'lodash/random';
import { v4 as uuidv4 } from 'uuid';

import { songScaffold } from '../../../src/music/constants';
import { LoopType, PlaylistShape, SongShape } from '../../../src/music/types';
import { DisplayedPlaylistShape } from '../../../src/music/list/types';
import {
  generateNowPlayingTag,
  generateVolumeTag,
} from '../../../src/music/list';
import { rawTracks } from './constants';

const generateMockTracks = (length: number): SongShape[] => {
  return Array.from({ length }).map((_, i) => {
    return {
      id: uuidv4(),
      title: rawTracks[random(0, rawTracks.length - 1)].title,
      url: rawTracks[random(0, rawTracks.length - 1)].url,
      volume: rawTracks[random(0, rawTracks.length - 1)].volume,
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

export const cases = {
  generateDisplayedPlaylistPages: [
    (() => {
      const tracks = generateMockTracks(0);
      return {
        input: {
          playlist: generatePlaylist(tracks, -1),
        },
        output: {
          currentPageIndex: -1,
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
      const tracks = generateMockTracks(2);
      return {
        input: { playlist: generatePlaylist(tracks, 0) },
        output: {
          currentPageIndex: 0,
          pages: [
            {
              title: 'Default Playlist',
              description: 'Now playing the **default** playlist:',
              fields: [
                ...tracks.map((track, i) => {
                  return {
                    name: `${i + 1}. ${generateNowPlayingTag({
                      currentTrackId: tracks[0].id,
                      iteratedTrackId: track.id,
                      nextTrackId: tracks[1].id,
                      playlistLoopType: 'off',
                      isLastSong: false,
                    })} ${generateVolumeTag(track.volume)}`,
                    value: `${track.title}\n${track.url}`,
                  };
                }),
              ],
            },
          ],
        },
      };
    })(),
    (() => {
      const tracks1 = generateMockTracks(10);
      const tracks2 = generateMockTracks(4);
      return {
        input: { playlist: generatePlaylist([...tracks1, ...tracks2], 0) },
        output: {
          currentPageIndex: 0,
          pages: [
            {
              title: 'Default Playlist',
              description: `Current page: ${1}/${2}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${1} to ${2}}\`.\n`,
              fields: [
                ...tracks1.map((track, i) => {
                  return {
                    name: `1. ${generateNowPlayingTag({
                      currentTrackId: tracks1[0].id,
                      iteratedTrackId: track.id,
                      nextTrackId: tracks1[1].id,
                      playlistLoopType: 'off',
                      isLastSong: false,
                    })} ${generateVolumeTag(track.volume)}`,
                    value: `${track.title}\n${track.url}`,
                  };
                }),
                {
                  name: '\u200b',
                  value: `Current page: ${1}/${2}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${1} to ${2}}\`.\n`,
                  inline: false,
                },
              ],
            },
            {
              title: 'Default Playlist',
              description: `Current page: ${2}/${2}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${2} to ${2}}\`.\n`,
              fields: [
                ...tracks2.map((track, i) => {
                  return {
                    name: `${i + 1 + 10}. ${generateNowPlayingTag({
                      currentTrackId: tracks1[0].id,
                      iteratedTrackId: track.id,
                      nextTrackId: tracks1[1].id,
                      playlistLoopType: 'off',
                      isLastSong: false,
                    })} ${generateVolumeTag(track.volume)}`,
                    value: `${track.title}\n${track.url}`,
                  };
                }),
                {
                  name: '\u200b',
                  value: `Current page: ${2}/${2}.\nTo move to another page within the **default** playlist, send \`;q {any number between ${2} to ${2}}\`.\n`,
                  inline: false,
                },
              ],
            },
          ],
        },
      };
    })(),
  ] as {
    input: { playlist: PlaylistShape };
    output: DisplayedPlaylistShape;
  }[],
};
