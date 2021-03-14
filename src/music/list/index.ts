import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import { chunk, truncate } from 'lodash';
import isNil from 'lodash/isNil';

import { BOT_PREFIX, THEME_COLOUR } from '../../constants';
import {
  maxAllowableVolume,
  playYoutubeLinkPrefixCommands,
} from '../constants';
import { defaultPlaylistName, getPlaylist } from '../playlist';
import { LoopType, PlaylistShape, SongShape } from '../types';
import { DisplayedPlaylistShape } from './types';

/**
 * @see https://discordjs.guide/popular-topics/embeds.html#embed-limits
 */
const limits = {
  authorName: 256,
  title: 256,
  numberOfFields: 25,
  fieldName: 256,
  fieldValue: 1024,
};

export const generateNowPlayingTag = ({
  currentTrackId,
  iteratedTrackId,
  nextTrackId,
  playlistLoopType,
  isLastSong,
}: {
  currentTrackId: string;
  iteratedTrackId: string;
  nextTrackId: string;
  playlistLoopType: LoopType;
  isLastSong: boolean;
}) => {
  if (
    iteratedTrackId === currentTrackId &&
    iteratedTrackId === nextTrackId &&
    playlistLoopType !== 'off'
  ) {
    return '**:arrow_forward: :repeat_one: `Looping this song`** |';
  }
  if (iteratedTrackId === currentTrackId) {
    if (isLastSong && playlistLoopType === 'off') {
      return '**:arrow_forward: :eject: `Now playing (last song)`** |';
    }
    return '**:arrow_forward: `Now playing`**';
  }
  if (iteratedTrackId === nextTrackId) {
    if (isLastSong && playlistLoopType === 'off') {
      return '**:track_next: :eject: `Up next (last song)`** |';
    }
    return '**:track_next: `Up next`** |';
  }
  return '';
};

export const generateVolumeTag = (volume: number) => {
  if (volume > maxAllowableVolume * 0.75) {
    return `:loud_sound: **${volume} / ${maxAllowableVolume}**`;
  }
  if (volume > maxAllowableVolume * 0.25) {
    return `:sound: **${volume} / ${maxAllowableVolume}**`;
  }
  if (volume > 0) {
    return `:speaker: **${volume} / ${maxAllowableVolume}**`;
  }
  return `:mute: **${volume} / ${maxAllowableVolume}**`;
};

export const generateDisplayedPlaylistPages = (params: {
  playlist: PlaylistShape;
}): DisplayedPlaylistShape => {
  const { playlist } = params;
  const currentTrackId = playlist.currentSong.id;
  const nextTrackId = playlist.nextSong.id;
  const loopType = playlist.loop;
  const loopMessages: Record<LoopType, string> = {
    playlist: 'Now looping',
    off: 'Now playing',
    song: `Just playing one song from`,
  };

  const trackChunkedPlaylist = playlist.songs.reduce(
    (
      eventualTrackList: {
        currentTrackIndex: number;
        fields: EmbedFieldData[];
      },
      currentTrackOnList,
      index: number,
      songsList: SongShape[],
    ) => {
      const nowPlayingTag = generateNowPlayingTag({
        currentTrackId,
        iteratedTrackId: currentTrackOnList.id,
        nextTrackId,
        playlistLoopType: loopType,
        isLastSong: index === songsList.length - 1,
      });

      const volumeTag = generateVolumeTag(currentTrackOnList.volume);

      return {
        currentTrackIndex:
          currentTrackOnList.id === currentTrackId
            ? index
            : eventualTrackList.currentTrackIndex,
        fields: [
          ...eventualTrackList.fields,
          {
            name: `${index + 1}. ${nowPlayingTag} ${volumeTag}`,
            value: truncate(
              [
                `${currentTrackOnList.title}`,
                `<${currentTrackOnList.url}>`,
              ].join('\n'),
              {
                length: limits.fieldValue - 100,
              },
            ),
          },
        ],
      };
    },
    { currentTrackIndex: -1, fields: [] },
  );

  const title = 'Default Playlist';
  // Use 10 or hard limit - 4
  const softLimit =
    limits.numberOfFields - 4 > 10 ? 10 : limits.numberOfFields - 4;

  if (trackChunkedPlaylist.fields.length <= softLimit) {
    return {
      pages: [
        {
          title,
          description: `${loopMessages[loopType]} the **${defaultPlaylistName}** playlist:`,
          fields: [...trackChunkedPlaylist.fields],
        },
      ],
      currentPageIndex: trackChunkedPlaylist.fields.length === 0 ? -1 : 0,
    };
  }

  const pagesOfTracks = chunk(trackChunkedPlaylist.fields, softLimit);
  const pageIndexOfCurrentTrack = pagesOfTracks.reduce(
    (eventualPageIndexOfCurrentTrackLv1, pageOfTracks, pageIndex) => {
      return pageOfTracks.reduce(
        (eventualPageIndexOfCurrentTrackLv2, _, iteratedTrackIndex) => {
          if (
            pageIndex * softLimit + iteratedTrackIndex ===
            trackChunkedPlaylist.currentTrackIndex
          ) {
            return pageIndex;
          }
          return eventualPageIndexOfCurrentTrackLv2;
        },
        eventualPageIndexOfCurrentTrackLv1,
      );
    },
    0,
  );

  const generateFooter = (pp: number) =>
    `Current page: ${pp}/${pagesOfTracks.length}.\nTo move to another page within the **${defaultPlaylistName}** playlist, send \`;q {any number between ${pp} to ${pagesOfTracks.length}}\`.\n`;

  return {
    pages: pagesOfTracks.map((pageOfFields, i) => {
      return {
        title,
        description: generateFooter(i + 1),
        fields: [
          ...pageOfFields,
          {
            name: '\u200b',
            value: generateFooter(i + 1),
            inline: false,
          },
        ],
      };
    }),
    currentPageIndex: pageIndexOfCurrentTrack,
  };
};

export const list = async (
  message: Message,
  options: {
    pageNrRequested?: number;
  },
) => {
  const { pageNrRequested } = options;
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (isNil(playlist)) {
    const playlistPageEmbed = new MessageEmbed()
      .setColor(THEME_COLOUR)
      .setTitle('No playlist found')
      .setDescription(
        `To begin playing tracks, enter a voice channel then add a YouTube playlist or YouTube video link: \`${BOT_PREFIX}${playYoutubeLinkPrefixCommands[0]} {YouTube Link / Playlist}\`. Botus will then join you in VC and play the audio of your newly added track of your voice channel.`,
      );
    return message.channel.send(playlistPageEmbed);
  }

  const { currentPageIndex, pages } = generateDisplayedPlaylistPages({
    playlist,
  });

  const requestedPageIndex = (() => {
    if (pageNrRequested) {
      if (isFinite(pageNrRequested) && pages[pageNrRequested - 1]) {
        return pageNrRequested - 1;
      }
      message.channel.send(
        "That page you requested doesn't exist. I'll show the first page or page with the current track instead.",
      );
    }
    return currentPageIndex;
  })();

  if (pages[requestedPageIndex]) {
    const page = pages[requestedPageIndex];
    const playlistPageEmbed = new MessageEmbed()
      .setColor(THEME_COLOUR)
      .setAuthor(
        truncate(message.member?.nickname ?? message.author.username, {
          length: limits.authorName - 10,
        }),
        message.author.avatarURL() ?? undefined,
      )
      .setTitle(page.title)
      .setDescription(page.description ?? '')
      .addFields(page.fields);
    return message.channel.send(playlistPageEmbed);
  }

  for (const page of pages) {
    const playlistPageEmbed = new MessageEmbed()
      .setColor(THEME_COLOUR)
      .setAuthor(
        truncate(message.member?.nickname ?? message.author.username, {
          length: limits.authorName - 10,
        }),
        message.author.avatarURL() ?? undefined,
      )
      .setTitle(page.title)
      .setDescription(page.description ?? '')
      .addFields(page.fields);
    await message.channel.send(playlistPageEmbed);
  }
};
