import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import { truncate } from 'lodash';
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

  //TODO: Figure out why for current track 11, page 1 is still current page
  const { pageNrOfCurrentTrack, pages } = trackChunkedPlaylist.fields.reduce(
    (eventualPagedData, currentChunk, currentChunkIndex) => {
      const currentPages = eventualPagedData.pages;
      const currLastPageIndex = currentPages.length - 1;
      const nextEventualPagedData =
        currentChunkIndex === trackChunkedPlaylist.currentTrackIndex
          ? {
              ...eventualPagedData,
              pageNrOfCurrentTrack: eventualPagedData.currentPageIndex,
            }
          : eventualPagedData;
      if (currentPages.length === 0) {
        return {
          ...nextEventualPagedData,
          pages: [[currentChunk]],
        };
      }

      const currentPage = currentPages[currLastPageIndex];
      if (
        currentChunkIndex <
        softLimit * (eventualPagedData.currentPageIndex + 1)
      ) {
        const remainderPages = [...currentPages];
        remainderPages.splice(currLastPageIndex, 1);
        // Append to existing last section
        return {
          ...nextEventualPagedData,
          pages: [...remainderPages, [...currentPage, currentChunk]],
          currentPageIndex: currLastPageIndex
            ? eventualPagedData.currentPageIndex + 1
            : eventualPagedData.currentPageIndex,
        };
      }
      // Add section
      return {
        ...nextEventualPagedData,
        pages: [...currentPages, [currentChunk]],
      };
    },
    {
      pages: [] as EmbedFieldData[][],
      currentPageIndex: 0,
      pageNrOfCurrentTrack: -1,
    },
  );

  const generateFooter = (pp: number) =>
    `Current page: ${pp}/${pages.length}.\nTo move to another page within the **${defaultPlaylistName}** playlist, send \`;q {any number between ${pp} to ${pages.length}}\`.\n`;

  return {
    pages: pages.map((pageOfFields, i) => {
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
    currentPageIndex: pageNrOfCurrentTrack,
  };
};

export const list = async (message: Message) => {
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

  // NOTE: Temp until request integration
  const pageIndexRequested = (() => {
    const nlpCandidates = message.content.match(/ (pg?|page) [\d]+/gim);
    const queryCandidates = message.content.match(/^;q [\d]+$/gim);
    if (nlpCandidates && nlpCandidates[0]) {
      const innerPageNrCands = nlpCandidates[0].split(/ (pg?|page) /);
      const pageRequested = parseInt(innerPageNrCands[2], 10);
      if (isFinite(pageRequested)) {
        return pageRequested - 1;
      }
      message.channel.send(
        "That page you requested doesn't exist. I'll show the first page or page with the current track instead.",
      );
    }
    if (queryCandidates && queryCandidates[0]) {
      const innerPageNrCands = queryCandidates[0].split(';q ');
      const pageRequested = parseInt(innerPageNrCands[1], 10);
      if (isFinite(pageRequested)) {
        return pageRequested - 1;
      }
      message.channel.send(
        "That page you requested doesn't exist. I'll show the first page or page with the current track instead.",
      );
    }
    return 'current';
  })();

  const { currentPageIndex, pages } = generateDisplayedPlaylistPages({
    playlist,
  });

  const requestedPageIndex = (() => {
    if (pageIndexRequested === 'current' || !pages[pageIndexRequested]) {
      return currentPageIndex;
    }
    return pageIndexRequested;
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
