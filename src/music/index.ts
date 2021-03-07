import { Message } from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import { v4 as uuidv4 } from 'uuid';

import isFinite from 'lodash/isFinite';
import isNull from 'lodash/isNull';

import { multiServerSession } from '../constants';
import { reactWithEmoji } from '../social';
import {
  maxAllowableVolume,
  songScaffold,
  loopOrder,
  loopOrderedMessages,
  existingTrackPattern,
  resetPlaylistRequests,
  listRequests,
} from './constants';
import { LoopType, PlaylistShape, SongShape } from './types';
import { getNextLoopedIndex } from '../utils';
import logger from '../logger';
import { getYoutubeLinkAndVolFromRequest } from './helper';

const defaultPlaylistName = 'default';

export const createServerSession = async (message: Message) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return null;
  }
  const serverSession = multiServerSession.get(serverId);

  const generateNewPlaylist = (): PlaylistShape => {
    const voiceChannel = message.member?.voice.channel ?? null;
    return {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 0,
      currentSong: songScaffold,
      previousSong: songScaffold,
      nextSong: songScaffold,
      loop: 'off',
      stopOnFinish: false,
      disconnectOnFinish: false,
      isWriteLocked: false,
    };
  };

  if (!serverSession) {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      return null;
    }
    const newPlaylist: PlaylistShape = generateNewPlaylist();
    const newServerSession = {
      playlists: {
        [defaultPlaylistName]: newPlaylist,
      },
    };
    multiServerSession.set(serverId, newServerSession);
    return newServerSession;
  }

  // Reset playlists
  if (message.content.match(resetPlaylistRequests[0])) {
    const candidates = message.content.split(/;(forcereset|hardreset) /gim);
    const playlistName = (() => {
      if (candidates?.[0] && candidates[0] !== '') {
        return candidates[0];
      }
      return defaultPlaylistName;
    })();
    await clear(message);
    if (serverSession.playlists[playlistName]) {
      delete serverSession.playlists[playlistName];
    }
    const newPlaylist: PlaylistShape = generateNewPlaylist();
    const newServerSession = {
      ...serverSession,
      playlists: { [defaultPlaylistName]: newPlaylist },
    };
    multiServerSession.set(serverId, newServerSession);
    reactWithEmoji.succeeded(message);
    return newServerSession;
  }
  return serverSession;
};

const createPlaylist = async (
  message: Message,
  name: string,
  purpose: string,
) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return null;
  }
  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    message.channel.send(
      `I can't create a new playlist named "${name}" to ${purpose} as no one is in voice chat.`,
    );
    return null;
  }
  const newPlaylist: PlaylistShape = {
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 0,
    currentSong: songScaffold,
    previousSong: songScaffold,
    nextSong: songScaffold,
    loop: 'off',
    stopOnFinish: false,
    disconnectOnFinish: false,
    isWriteLocked: false,
  };
  if (!multiServerSession.has(serverId)) {
    // This will always run until multi-playlists are supported
    const serverSession = await createServerSession(message);
    const playlist = serverSession?.playlists[name] || null;
    return playlist;
  }
  const serverSession = multiServerSession.get(serverId);
  if (!serverSession) {
    // Redundant for typing consistency
    return null;
  }
  const playlist = serverSession?.playlists[name];
  if (playlist) {
    logger.log({
      level: 'error',
      message: `Unable to create a new playlist as already exists to ${purpose}. - ${name}`,
    });
    return null;
  }
  multiServerSession.set(serverId, {
    ...serverSession,
    playlists: {
      ...serverSession.playlists,
      [defaultPlaylistName]: newPlaylist,
    },
  });
  return newPlaylist;
};

const getPlaylist = (message: Message, name: string) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return null;
  }
  if (!multiServerSession.has(serverId)) {
    return null;
  }
  const serverSession = multiServerSession.get(serverId);
  const playlist = serverSession?.playlists[name];
  if (playlist) {
    return playlist;
  }
  return null;
};

const deletePlaylist = (message: Message, name: string) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return message.channel.send('_struggles to find the playlist to delete._');
  }
  const serverSession = multiServerSession.get(serverId);
  if (!serverSession) {
    return;
  }
  const playlists = serverSession.playlists;

  delete playlists[name];
  multiServerSession.set(serverId, {
    ...serverSession,
    playlists,
  });
};

export const setPlaylist = (
  message: Message,
  name: string,
  playlist: PlaylistShape,
) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return message.channel.send('_struggles to find the playlist to update._');
  }
  const serverSession = multiServerSession.get(serverId);
  if (!serverSession) {
    return;
  }
  multiServerSession.set(serverId, {
    ...serverSession,
    playlists: {
      ...serverSession.playlists,
      [name]: { ...playlist, isWriteLocked: false },
    },
  });
};

/**
 *
 * @param playlist
 * @param stepsToNextSong Location of next song relative to current song. Must never be 0.
 * @returns {[SongShape, SongShape, SongShape]} Current song, next song and next next song if steps down or
 * up the playlist was made. They should always be a song inside the playlist. Previous song is
 * the song if back button was pressed.
 */
const dryRunTraversePlaylistByStep = (
  playlist: PlaylistShape,
  stepsToNextSong: number,
): [SongShape, SongShape, SongShape, SongShape] => {
  const indexOfCurrentSong = playlist.songs.findIndex(
    (s) => s.id === playlist.currentSong?.id,
  );
  if (playlist.loop === 'song') {
    return [
      playlist.songs[indexOfCurrentSong] || songScaffold,
      playlist.songs[indexOfCurrentSong] || songScaffold,
      playlist.songs[indexOfCurrentSong] || songScaffold,
      playlist.songs[indexOfCurrentSong] || songScaffold,
    ];
  }

  if (playlist.loop === 'playlist') {
    const previousSongIndex = getNextLoopedIndex(
      playlist.songs,
      (_, i) => i === indexOfCurrentSong,
      -stepsToNextSong,
    );
    const nextSongIndex = getNextLoopedIndex(
      playlist.songs,
      (_, i) => i === indexOfCurrentSong,
      stepsToNextSong,
    );
    const nextNextSongIndex = getNextLoopedIndex(
      playlist.songs,
      (_, i) => i === indexOfCurrentSong,
      stepsToNextSong > 0 ? stepsToNextSong * 2 : -stepsToNextSong * 2,
    );
    return [
      playlist.songs[previousSongIndex] || songScaffold,
      playlist.songs[indexOfCurrentSong] || songScaffold,
      playlist.songs[nextSongIndex] || songScaffold,
      playlist.songs[nextNextSongIndex] || songScaffold,
    ];
  }
  const prevSong =
    playlist.songs[indexOfCurrentSong - stepsToNextSong] || playlist.songs[0];
  const nextSong =
    playlist.songs[indexOfCurrentSong + stepsToNextSong] || songScaffold;
  const nextNextSong =
    playlist.songs[indexOfCurrentSong + stepsToNextSong * 2] || songScaffold;

  return [
    prevSong,
    playlist.songs[indexOfCurrentSong] || songScaffold,
    nextSong,
    nextNextSong,
  ];
};

export const displayDebugValues = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  const nonCircularPlaylist = playlist
    ? {
        textChannel: playlist.textChannel ? '[exists]' : null,
        voiceChannel: playlist.voiceChannel ? '[exists]' : null,
        connection: playlist.connection
          ? {
              dispatcher: playlist.connection.dispatcher ? '[exists]' : null,
            }
          : null,
        songs: playlist.songs,
        volume: playlist.volume,
        currentSong: playlist.currentSong,
        previousSong: playlist.previousSong,
        nextSong: playlist.nextSong,
        loop: playlist.loop,
        stopOnFinish: playlist.stopOnFinish,
        disconnectOnFinish: playlist.disconnectOnFinish,
        isWriteLocked: playlist.isWriteLocked,
      }
    : null;
  const debugMessage = [
    '',
    '{',
    `  ["${defaultPlaylistName}"]: ${JSON.stringify(
      nonCircularPlaylist,
    ).replace('"', "'")}`,
    '}',
    '',
  ];
  logger.log({
    level: 'error',
    message: `Debug Values: ${debugMessage.join('\n')}`,
  });
  reactWithEmoji.succeeded(message);
  return;
};

export const play = (message: Message, song: SongShape) => {
  if (!message.guild?.id) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No guild ID found while attempting to play a song.`,
    });
    return;
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist || !song) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No playlist or song found while attempting to play a song.`,
    });
    return;
  }

  playlist.isWriteLocked = true; // Prevents concurrent conflict writes to the playlist

  if (!playlist.connection) {
    playlist.textChannel?.send(
      '_flips his glorious hair and leaves silently._',
    );
    playlist.isWriteLocked = false;
    if (playlist.disconnectOnFinish) {
      playlist.disconnectOnFinish = false;
      playlist.voiceChannel?.leave();
    }
    setPlaylist(message, defaultPlaylistName, playlist);
    return;
  }

  if (song.id === songScaffold.id) {
    playlist.textChannel.send("That's all the tracks.");
    playlist.isWriteLocked = false;
    if (playlist.disconnectOnFinish) {
      playlist.disconnectOnFinish = false;
      playlist.voiceChannel?.leave();
    }
    setPlaylist(message, defaultPlaylistName, playlist);
    return;
  }
  const dispatcher = playlist.connection
    .play(ytdl(song.url, { filter: 'audioonly' }))
    .on('debug', (info) => {
      logger.log({
        level: 'error',
        message: `Connection debug event triggered. ${JSON.stringify(info)}`,
      });
      reactWithEmoji.failed(message);
      stop(message);
    })
    .on('start', () => {
      dispatcher.setVolumeLogarithmic(song.volume / 5);
      playlist.textChannel.send(
        `Playing **${song.title}** (Volume: ${song.volume} / ${maxAllowableVolume}).`,
      );
      playlist.isWriteLocked = false;
      const [
        previousSong,
        currentSong,
        nextSong,
      ] = dryRunTraversePlaylistByStep({ ...playlist, currentSong: song }, 1);
      playlist.previousSong = previousSong;
      playlist.currentSong = currentSong;
      playlist.nextSong = nextSong;
      reactWithEmoji.succeeded(message);
      setPlaylist(message, defaultPlaylistName, playlist);
    })
    .on('finish', () => {
      const playlistOnFinish = getPlaylist(message, defaultPlaylistName);
      if (!playlistOnFinish) {
        return logger.log({
          level: 'error',
          message: `Playlist no longer exists.`,
        });
      }

      playlistOnFinish.isWriteLocked = true;

      if (playlistOnFinish.stopOnFinish) {
        playlistOnFinish.previousSong = songScaffold;
        playlistOnFinish.currentSong = songScaffold;
        playlistOnFinish.nextSong = songScaffold;
        playlistOnFinish.stopOnFinish = false;
        playlistOnFinish.isWriteLocked = false;
        playlistOnFinish.textChannel.send('Stopping track.');
        if (playlistOnFinish.disconnectOnFinish) {
          playlistOnFinish.connection = null;
          playlistOnFinish.disconnectOnFinish = false;
          playlistOnFinish.voiceChannel?.leave();
        }
        setPlaylist(message, defaultPlaylistName, playlistOnFinish);
        return;
      }
      const [
        _,
        currentSong,
        nextSong,
        nextNextSong,
      ] = dryRunTraversePlaylistByStep(playlistOnFinish, 1);
      playlistOnFinish.previousSong = currentSong;
      playlistOnFinish.currentSong = nextSong;
      playlistOnFinish.nextSong = nextNextSong;
      playlistOnFinish.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlistOnFinish);
      play(message, nextSong);
    })
    .on('error', (error: any) => {
      logger.log({
        level: 'error',
        message: `Error occurred while playing song: ${error}`,
      });
    });
};

export const playExistingTrack = async (message: Message) => {
  reactWithEmoji.received(message);
  if (!message.guild?.id) {
    logger.log({
      level: 'error',
      message: `No guild ID found while attempting to play an existing track.`,
    });
    reactWithEmoji.failed(message);
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first.",
    );
  }
  if (!message?.client?.user) {
    logger.log({
      level: 'error',
      message: `No user found while attempting to play an existing track.`,
    });
    reactWithEmoji.failed(message);
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions?.has('CONNECT') || !permissions.has('SPEAK')) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      'Give me permissions for connecting and speaking in the voice channel, then we can party.',
    );
  }
  const matches = message.content.match(existingTrackPattern);
  const existingTrackNr = parseInt(matches?.[0] ?? '-');
  if (!matches || !isFinite(existingTrackNr)) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      'I can only play existing track numbers, like in numbers, or new tracks that must be YouTube links.',
    );
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Unable to play existing track ${existingTrackNr} as the **${defaultPlaylistName}** playlist does not exist.`,
    });
    return;
  }
  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Unable to play existing track ${existingTrackNr} as playlist is write locked.`,
    });
    return;
  }
  playlist.isWriteLocked = true;
  setPlaylist(message, defaultPlaylistName, playlist);
  const existingTrackIndex = playlist.songs.findIndex(
    (_, i) => i === existingTrackNr - 1,
  );
  if (existingTrackIndex === -1) {
    reactWithEmoji.failed(message);
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `Track ${existingTrackNr} doesn't exist on the **${defaultPlaylistName}** playlist.`,
    );
  }
  const existingTrack = playlist.songs[existingTrackIndex];
  try {
    if (voiceChannel.joinable) {
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      setPlaylist(message, defaultPlaylistName, playlist);
    } else {
      throw new Error('Not joinable.');
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error occurred while joining the voice channel: ${error}`,
    });
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    reactWithEmoji.failed(message);
    return message.channel.send(
      `I can't seem to join the voice channel to play that track.`,
    );
  }
  playlist.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlist);
  play(message, existingTrack);
};

const addTrackToPlaylist = async (
  message: Message,
  title: string,
  url: string,
  trackVolume: number,
) => {
  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No voice channel while adding track to playlist.- ${title}`,
    });
    return;
  }
  const song = {
    id: uuidv4(),
    title,
    url,
    volume: trackVolume,
  };
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    const newPlaylist = await createPlaylist(
      message,
      defaultPlaylistName,
      'adding a track to the playlist',
    );
    try {
      if (isNull(newPlaylist)) {
        throw new Error('No playlist found.');
      }
      const connection = await voiceChannel.join();
      setPlaylist(message, defaultPlaylistName, {
        ...newPlaylist,
        connection,
        currentSong: song,
        songs: [song],
      });
      play(message, song);
    } catch (error) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Error occurred while creating a new playlist: ${error.message}`,
      });
    }
    return;
  }
  playlist.isWriteLocked = true;
  playlist.songs.push(song);
  setPlaylist(message, defaultPlaylistName, playlist);
  if (
    !playlist?.currentSong?.id ||
    playlist?.currentSong?.id === songScaffold.id
  ) {
    if (!playlist.connection) {
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      setPlaylist(message, defaultPlaylistName, playlist);
    }
    play(message, song);
  }
  const [previousSong, currentSong, nextSong] = dryRunTraversePlaylistByStep(
    playlist,
    1,
  );
  playlist.previousSong = previousSong;
  playlist.currentSong = currentSong;
  playlist.nextSong = nextSong;
  playlist.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlist);
};

export const playAndOrAddYoutubeToPlaylist = async (message: Message) => {
  reactWithEmoji.received(message);
  if (!message.guild?.id) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No guild ID found while attempting to play and or add an existing YouTube link.`,
    });
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first.",
    );
  }
  if (!message?.client?.user) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No user found while attempting to play and or add an existing YouTube link.`,
    });
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions?.has('CONNECT') || !permissions.has('SPEAK')) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      'Give me permissions for connecting and speaking in the voice channel, then we can party.',
    );
  }

  const {
    volume,
    maxAllowableReached,
    link,
    playlistId,
  } = getYoutubeLinkAndVolFromRequest(message.content, maxAllowableVolume);

  if (link === '#') {
    reactWithEmoji.failed(message);
    return message.channel.send("...I can't play _that_.");
  }

  if (maxAllowableReached) {
    message.channel.send(
      `._shakes his head_ I won't play songs louder than a level of **${maxAllowableReached}**.`,
    );
  }

  if (playlistId !== '-') {
    // YouTube playlist
    try {
      const playlistIdIsValid = ytpl.validateID(playlistId);
      if (playlistIdIsValid) {
        const youtubePlaylist = await ytpl(playlistId);
        const numberOfTracks = youtubePlaylist.items.length;
        for (const track of youtubePlaylist.items) {
          await addTrackToPlaylist(
            message,
            track.title,
            track.shortUrl,
            volume,
          );
        }
        reactWithEmoji.succeeded(message);
        return message.channel.send(
          `_nods and adds_ **${numberOfTracks}** _tracks with volume at_ **${volume}** _to the list._`,
        );
      }
    } catch (error) {}
  }

  // Single track
  const songInfo = await ytdl.getInfo(link);
  await addTrackToPlaylist(
    message,
    songInfo.videoDetails.title,
    songInfo.videoDetails.video_url,
    volume,
  );
  reactWithEmoji.succeeded(message);
  return message.channel.send(
    `_nods and adds_ **${songInfo.videoDetails.title}** with volume at **${volume}** _to the list._`,
  );
};

export const joinVoiceChannel = async (message: Message) => {
  reactWithEmoji.received(message);
  let playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    playlist = await createPlaylist(
      message,
      defaultPlaylistName,
      'join a voice channel',
    );
  }
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No playlist created even after attempting create one. - ${defaultPlaylistName}`,
    });
    return;
  }
  const voiceChannel = message.member?.voice.channel;
  try {
    if (!voiceChannel) {
      throw new Error(`No one is in a voice channel.`);
    }
    if (!voiceChannel.joinable) {
      throw new Error(`I can't seem to join the voice channel.`);
    }
    const connection = await voiceChannel.join();
    playlist.connection = connection;
    if (!playlist.connection) {
      throw new Error("There isn't a playlist connection.");
    }
    setPlaylist(message, defaultPlaylistName, playlist);
    reactWithEmoji.succeeded(message);
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error occurred while joining the voice channel: ${error.message}`,
    });
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    reactWithEmoji.failed(message);
    return message.channel.send(error.message);
  }
};

export const disconnectVoiceChannel = async (message: Message) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    return message.channel.send('There is no such playlist.');
  }
  playlist.disconnectOnFinish = true;
  setPlaylist(message, defaultPlaylistName, playlist);
  await stop(message);
};

/**
 * Shows the playlist
 */
export const list = async (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    return message.channel.send('There is no such playlist.');
  }
  if (!playlist.currentSong) {
    return message.channel.send(
      `Nothing is playing at the moment for the **${defaultPlaylistName}** playlist.`,
    );
  }
  if (playlist.songs.length === 0) {
    return message.channel.send(
      `There are no songs in the **${defaultPlaylistName}** playlist.`,
    );
  }
  const currentSongId = playlist.currentSong.id;
  const nextSongId = playlist.nextSong.id;
  const loopType = playlist.loop;
  const loopMessages: Record<LoopType, string> = {
    playlist: 'Now looping',
    off: 'Now playing',
    song: `Just playing one song from`,
  };

  const trackChunkedPlaylist = playlist.songs.reduce(
    (
      eventualTrackList: { currentTrackIndex: number; tracks: string[] },
      currentTrackOnList,
      index: number,
      songsList: SongShape[],
    ) => {
      reactWithEmoji.received(message);
      const nowPlayingTag = (() => {
        if (
          currentTrackOnList.id === currentSongId &&
          currentTrackOnList.id === nextSongId &&
          playlist.loop !== 'off'
        ) {
          return '**:arrow_forward: :repeat_one: `Looping this song`** |';
        }
        if (currentTrackOnList.id === currentSongId) {
          if (index === songsList.length - 1 && loopType === 'off') {
            return '**:arrow_forward: :eject: `Now playing (last song)`** |';
          }
          return '**:arrow_forward: `Now playing`**';
        }
        if (currentTrackOnList.id === nextSongId) {
          if (index === songsList.length - 1 && loopType === 'off') {
            return '**:track_next: :eject: `Up next (last song)`** |';
          }
          return '**:track_next: `Up next`** |';
        }
        return '';
      })();

      const volumeTag = (() => {
        if (currentTrackOnList.volume > maxAllowableVolume * 0.75) {
          return `:loud_sound: **${currentTrackOnList.volume} / ${maxAllowableVolume}**`;
        }
        if (currentTrackOnList.volume > maxAllowableVolume * 0.25) {
          return `:sound: **${currentTrackOnList.volume} / ${maxAllowableVolume}**`;
        }
        if (currentTrackOnList.volume > 0) {
          return `:speaker: **${currentTrackOnList.volume} / ${maxAllowableVolume}**`;
        }
        return `:mute: **${currentTrackOnList.volume} / ${maxAllowableVolume}**`;
      })();
      const trackDetail = [
        `${index + 1}. ${nowPlayingTag} ${volumeTag}`,
        `${currentTrackOnList.title}`,
        `<${currentTrackOnList.url}>`,
      ].join('\n');
      return {
        currentTrackIndex:
          currentTrackOnList.id === currentSongId
            ? index
            : eventualTrackList.currentTrackIndex,
        tracks: [...eventualTrackList.tracks, trackDetail],
      };
    },
    { currentTrackIndex: 0, tracks: [] },
  );

  // Discord limit of 2000 in body
  const discordMessageCharLimit = 1990;

  const fullPlaylistFlattened = [
    `${loopMessages[loopType]} the **${defaultPlaylistName}** playlist:`,
    '',
    ...trackChunkedPlaylist.tracks,
    '',
  ].join('\n');
  if (fullPlaylistFlattened.length < discordMessageCharLimit) {
    return message.channel.send(fullPlaylistFlattened);
  }

  const processPageHeader = (i: number, pagesLength: number) => {
    return `Showing **${defaultPlaylistName}** playlist. Current page: ${
      i + 1
    }/${pagesLength}.\nTo move to another page within the playlist, send \`;q {any number between 1 to ${pagesLength}}\`.`;
  };
  const processPageFooter = (i: number, pagesLength: number) => {
    return `Current page: ${
      i + 1
    }/${pagesLength}.\nTo move to another page within the **${defaultPlaylistName}** playlist, send \`;q {any number between 1 to ${pagesLength}}\`.\n`;
  };

  const additionalContentLen =
    processPageHeader(1000, 1000).length + processPageFooter(1000, 1000).length;

  const { currentPageIndex, pages } = trackChunkedPlaylist.tracks.reduce(
    (eventualPagedData, currentChunk, currentChunkIndex) => {
      const currentPages = eventualPagedData.pages;
      if (currentPages.length === 0) {
        return { ...eventualPagedData, pages: [currentChunk] };
      }
      const currLastPageIndex = currentPages.length - 1;
      const currentPage = currentPages[currLastPageIndex];
      const propsectiveLen = currentPage.length + currentChunk.length;
      if (propsectiveLen < discordMessageCharLimit - additionalContentLen) {
        const remainderPages = [...currentPages];
        remainderPages.splice(currLastPageIndex, 1);
        return {
          ...eventualPagedData,
          currentPageIndex:
            currentChunkIndex === trackChunkedPlaylist.currentTrackIndex
              ? currLastPageIndex
              : eventualPagedData.currentPageIndex,
          // Append to existing last section
          pages: [...remainderPages, `${currentPage}\n${currentChunk}`],
        };
      }
      // Add section
      return {
        ...eventualPagedData,
        currentPageIndex:
          currentChunkIndex === trackChunkedPlaylist.currentTrackIndex
            ? currLastPageIndex
            : eventualPagedData.currentPageIndex,
        pages: [...currentPages, currentChunk],
      };
    },
    { pages: [] as string[], currentPageIndex: 0 },
  );
  let actualCurrentPageIndex = 0;

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
    return currentPageIndex;
  })();

  const matchForAll = message.content.match(/(everything|all)/gim);
  const matchForAllNLP = message.content.match(listRequests[2]);
  if (
    (matchForAll && matchForAll[0]) ||
    (matchForAllNLP && matchForAllNLP[0])
  ) {
    for (const page of pages) {
      await message.channel.send(
        `${processPageHeader(
          actualCurrentPageIndex,
          pages.length,
        )}\n\n${page}\n\n${processPageFooter(
          actualCurrentPageIndex,
          pages.length,
        )}\n`,
      );
      actualCurrentPageIndex = actualCurrentPageIndex + 1;
    }
    reactWithEmoji.succeeded(message);
    return;
  }

  if (pages[pageIndexRequested]) {
    await message.channel.send(
      `${processPageHeader(pageIndexRequested, pages.length)}\n\n${
        pages[pageIndexRequested]
      }\n\n${processPageFooter(pageIndexRequested, pages.length)}\n`,
    );
  }

  reactWithEmoji.succeeded(message);
  return;
};

export const skip = async (message: Message) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      'You have to be in a voice channel to stop the music!',
    );
  }
  if (!playlist) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "I can't skip if there isn't a playlist to skip songs with.",
    );
  }

  if (!playlist.connection?.dispatcher) {
    const voiceChannel = message.member?.voice.channel;
    try {
      if (!voiceChannel) {
        throw new Error('No voice channel.');
      }
      if (!voiceChannel.joinable) {
        throw new Error('Voice channel not joinable.');
      }
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      if (!playlist.connection) {
        throw new Error('Playlist connection invalid after joining.');
      }
      if (!playlist.connection.dispatcher) {
        throw new Error('No dispatcher after joining.');
      }
      setPlaylist(message, defaultPlaylistName, playlist);
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Error occurred while joining the voice channel to skip the current song: ${error.message}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      reactWithEmoji.failed(message);
      return message.channel.send(
        `I can't seem to join the voice channel to skip the current song.`,
      );
    }
  }
  reactWithEmoji.succeeded(message);
  playlist.connection.dispatcher.end();
};

export const removeSong = (message: Message) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "_looks at the empty playlist queue blankly._ There's nothing to remove.",
    );
  }
  if (!playlist.connection) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No connection.`,
    });
    return;
  }
  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Playlist is write locked and cannot remove songs at this time.`,
    });
    message.channel.send('_panics._ One at a time, dammit!');
    return;
  }
  playlist.isWriteLocked = true;
  setPlaylist(message, defaultPlaylistName, playlist);
  const songNrCandidate = (() => {
    const trackNrMentions = message.content.match(/(track|song) [\d]+/gim);
    if (trackNrMentions && trackNrMentions[0]) {
      const possibleTrackNrs = trackNrMentions[0].split(/(track|song) /gim);
      return possibleTrackNrs?.[2] ?? '-';
    }
    return message.content.split(/;rm /)[1];
  })();
  const parsedSongNrCandidate = parseInt(songNrCandidate, 10);
  if (!isFinite(parsedSongNrCandidate)) {
    playlist.isWriteLocked = false;
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Invalid song number candidate: "${songNrCandidate}"`,
    });
    setPlaylist(message, defaultPlaylistName, playlist);
    return;
  }
  const previousCurrentSong = playlist.currentSong;
  const songs = [...playlist.songs];
  const indexOfSongToBeRemoved = songs.findIndex(
    (_, i) => i === parsedSongNrCandidate - 1,
  );
  if (indexOfSongToBeRemoved === -1) {
    reactWithEmoji.failed(message);
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    logger.log({
      level: 'error',
      message: `Tried to remove a track that doesn't exist on the playlist. - ${indexOfSongToBeRemoved}`,
    });
    return;
  }
  const removedSong = songs[indexOfSongToBeRemoved];
  const updatedSongs = [...songs];
  updatedSongs.splice(parsedSongNrCandidate - 1, 1);
  const [
    nextPreviousSong,
    nextCurrentSong,
    nextNextSong,
  ] = dryRunTraversePlaylistByStep({ ...playlist, songs: updatedSongs }, 1);

  if (updatedSongs.length === 0 || previousCurrentSong?.id === removedSong.id) {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    if (playlist.connection.dispatcher) {
      playlist.connection.dispatcher.end();
    }
  }
  const updatedPlaylist = {
    ...playlist,
    previousSong: nextPreviousSong,
    currentSong: nextCurrentSong,
    nextSong: nextNextSong,
    songs: updatedSongs,
    isWriteLocked: false,
  };
  reactWithEmoji.succeeded(message);
  setPlaylist(message, defaultPlaylistName, updatedPlaylist);
  message.channel.send(
    `_removes_ **${removedSong.title}** _from the_ **${defaultPlaylistName}** _playlist and never looks back._`,
  );
};

export const loop = (message: Message, loopType?: LoopType) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist?.loop) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Can't set the loop as there is no playlist or loop setting to begin with.`,
    });
    return;
  }
  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Playlist is write locked and cannot set the loop at this time.`,
    });
    message.channel.send('_looks flustered._ Okay, okay, slow down.');
    return;
  }

  const nextLoopSettingIndex = (() => {
    if (loopType) {
      return getNextLoopedIndex(loopOrder, (l) => l === loopType, 0);
    }
    const prevLoop = playlist?.loop;
    return getNextLoopedIndex(loopOrder, (l) => l === prevLoop, 1);
  })();

  playlist.loop = loopOrder[nextLoopSettingIndex];
  const [previousSong, currentSong, nextSong] = dryRunTraversePlaylistByStep(
    playlist,
    1,
  );
  playlist.previousSong = previousSong;
  playlist.currentSong = currentSong;
  playlist.nextSong = nextSong;
  playlist.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlist);
  reactWithEmoji.succeeded(message);
  message.channel.send(loopOrderedMessages[nextLoopSettingIndex]);
};

export const stop = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      `I can't stop the **${defaultPlaylistName}** playlist if there isn't a voice channel.`,
    );
  }
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Playlist not found while stopping. - ${defaultPlaylistName}`,
    });
    return;
  }
  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Playlist is write locked and cannot stop the song at this time.`,
    });
    message.channel.send(
      '_panics a little and tries to manage the barrage of requests._',
    );
    return;
  }
  playlist.stopOnFinish = true;
  setPlaylist(message, defaultPlaylistName, playlist);
  if (!playlist?.connection) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Playlist has no connection to stop the current song.`,
    });
    return;
  }
  if (!playlist?.connection.dispatcher) {
    if (!playlist.disconnectOnFinish) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Playlist has no connection dispatcher to stop the current song.`,
      });
      return;
    }
    if (!playlist.voiceChannel) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Unable to leave voice channel as no voice channel and no connection dispatcher even when requested to disconnect on finish.`,
      });
      return;
    }
    reactWithEmoji.succeeded(message);
    playlist.voiceChannel?.leave();
    return;
  }
  reactWithEmoji.succeeded(message);
  playlist.connection.dispatcher.end();
};

export const clear = async (message: Message) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      `I can't stop and clear the **${defaultPlaylistName}** playlist if there isn't a voice channel.`,
    );
  }
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Playlist not found while clearing. - ${defaultPlaylistName}`,
    });
    return;
  }
  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Playlist is write locked and cannot clear the playlist at this time.`,
    });
    message.channel.send(
      '_raises his hand up in exasperation._ One at a time, jeez!',
    );
    return;
  }
  playlist.isWriteLocked = true;
  playlist.songs = [];
  playlist.previousSong = songScaffold;
  playlist.currentSong = songScaffold;
  playlist.nextSong = songScaffold;
  playlist.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlist);

  if (!playlist.connection?.dispatcher) {
    const voiceChannel = message.member?.voice.channel;
    try {
      if (!voiceChannel) {
        throw new Error('No voice channel.');
      }
      if (!voiceChannel.joinable) {
        throw new Error('Voice channel not joinable.');
      }
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      if (!playlist.connection) {
        throw new Error('Playlist connection invalid after joining.');
      }
      setPlaylist(message, defaultPlaylistName, playlist);
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Error occurred while joining the voice channel to clear the playlist: ${error.message}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      reactWithEmoji.failed(message);
      return;
    }
  }

  if (playlist.connection.dispatcher) {
    playlist.connection.dispatcher.end();
  } else {
    logger.log({
      level: 'error',
      message: `No dispatcher found even after attempting to start a new one in order to clear the playlist.`,
    });
  }

  if (playlist.voiceChannel) {
    playlist.voiceChannel?.leave();
  } else {
    logger.log({
      level: 'error',
      message: `No voice channel found found even after attempting to join one in order to clear the playlist.`,
    });
  }
  reactWithEmoji.succeeded(message);
  deletePlaylist(message, defaultPlaylistName);
};

export const setSongVolume = async (message: Message) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Playlist not found while setting track volume. - ${defaultPlaylistName}`,
    });
    return;
  }

  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Unable to set song volume as write lock is on.`,
    });
    message.channel.send(
      "_raises his hand up in exasperation._ I'll set your volume in good time. Hold that thought for a second.",
    );
    return;
  }

  playlist.isWriteLocked = true;
  setPlaylist(message, defaultPlaylistName, playlist);

  const requestedSongIndex = (() => {
    const candidates = message.content.match(/ (track|song|t|s) [\d]+/gim);
    if (candidates && candidates[0]) {
      const songNr = parseInt(
        candidates[0].split(/ (track|song|t|s) /gim)[2],
        10,
      );
      if (isFinite(songNr)) {
        if (playlist.songs[songNr - 1]) {
          // Song exists in songs
          return songNr - 1;
        }
        message.channel.send(
          `_shrugs_ I couldn't find the track number ${songNr} on the playlist.`,
        );
      }
    }
    return -1;
  })();

  const currentSongIndex = playlist.songs.findIndex(
    (s) => s.id === playlist.currentSong.id,
  );

  const songIndexToSet =
    requestedSongIndex === -1 ? currentSongIndex : requestedSongIndex;

  const volume: number | '-' = (() => {
    const volumeToSetForCurrentSong = (() => {
      const volShortCutMentions = message.content.match(
        /(^;v) [\d]+(\.\d+)?([ ?]|$)/gim,
      );

      if (volShortCutMentions && volShortCutMentions[0]) {
        return parseFloat(volShortCutMentions[0].split(/(^;v) /gim)[2]);
      }
      const volumeMentions = message.content.match(
        / vol(\.|ume)? ?(as|at|to|with|using)? [\d]+(\.\d+)?([ ?]|$)/gim,
      );

      if (volumeMentions && volumeMentions[0]) {
        return parseFloat(
          volumeMentions[0].split(
            /vol(\.|ume)? ?(as|at|to|with|using)? /gim,
          )[3],
        );
      }
      return null;
    })();

    if (isFinite(volumeToSetForCurrentSong)) {
      return volumeToSetForCurrentSong as number;
    }
    return '-';
  })();

  if (volume > maxAllowableVolume) {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `._shakes his head_ I won't play songs louder than a volume level of **${maxAllowableVolume}**.`,
    );
  }

  if (volume === '-') {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    reactWithEmoji.failed(message);
    return;
  }

  if (!playlist.connection?.dispatcher) {
    const voiceChannel = message.member?.voice.channel;
    try {
      if (!voiceChannel) {
        throw new Error('No voice channel.');
      }
      if (!voiceChannel.joinable) {
        throw new Error('Voice channel not joinable.');
      }
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      if (!playlist.connection) {
        throw new Error('Playlist connection invalid after joining.');
      }
      if (!playlist.connection.dispatcher) {
        throw new Error('No dispatcher after joining.');
      }
      setPlaylist(message, defaultPlaylistName, playlist);
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Error occurred while joining the voice channel to set the volume: ${error.message}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      reactWithEmoji.failed(message);
      return;
    }
  }

  if (!playlist.songs[songIndexToSet]) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Unable to find song to set current volume.`,
    });
    return;
  }

  const prevVolume = playlist.songs[songIndexToSet].volume;

  if (requestedSongIndex === -1) {
    if (!playlist.connection.dispatcher) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Unable to find dispatcher to set volume of current track.`,
      });
      return;
    }
    playlist.connection.dispatcher.setVolumeLogarithmic(volume / 5);
  }

  playlist.songs[songIndexToSet].volume = volume;
  setPlaylist(message, defaultPlaylistName, playlist);
  reactWithEmoji.succeeded(message);

  const songName = (() => {
    if (requestedSongIndex !== -1) {
      return `track ${requestedSongIndex + 1} (**${
        playlist.currentSong.title
      }**)`;
    }
    return `the current song`;
  })();

  return message.channel.send(
    `Volume for ${songName} changed from ~~${prevVolume} / ${maxAllowableVolume}~~ to ${volume} / ${maxAllowableVolume}.`,
  );
};
