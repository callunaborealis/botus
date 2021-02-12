import { Message } from 'discord.js';
import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import { v4 as uuidv4 } from 'uuid';

import chunk from 'lodash/chunk';
import round from 'lodash/round';
import isFinite from 'lodash/isFinite';
import isNull from 'lodash/isNull';

import { multiServerSession } from '../constants';
import {
  maxAllowableVolume,
  songScaffold,
  loopOrder,
  loopOrderedMessages,
  existingTrackPattern,
  resetPlaylistRequests,
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
    const candidates = message.content.match(';reset ');
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

    return newServerSession;
  }

  return serverSession;
};

const createPlaylist = async (message: Message, name: string) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return null;
  }
  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    message.channel.send(
      `I can't create a new playlist named "${name}" as no one is in voice chat.`,
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
    message.channel.send(
      `I can't create a new playlist named "${name}" as one already exists.`,
    );
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

export const play = (message: Message, song: SongShape) => {
  if (!message.guild?.id) {
    return;
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist || !song) {
    return;
  }

  playlist.isWriteLocked = true; // Prevents concurrent conflict writes to the playlist

  if (!playlist.connection) {
    playlist.textChannel?.send(
      '_flips his glorious hair and leaves silently._',
    );
    playlist.isWriteLocked = false;
    playlist.voiceChannel?.leave();
    setPlaylist(message, defaultPlaylistName, playlist);
    return;
  }

  if (song.id === songScaffold.id) {
    playlist.textChannel.send(
      "_lays back in his chair and lights a fresh cigarette._ That's all the tracks.",
    );
    playlist.isWriteLocked = false;
    playlist.voiceChannel?.leave();
    setPlaylist(message, defaultPlaylistName, playlist);
    return;
  }
  const dispatcher = playlist.connection
    .play(ytdl(song.url, { filter: 'audioonly' }))
    .on('debug', (info) => {
      playlist.textChannel.send(
        "_frowns_. That's odd, I can't play this track. Try finding another.",
      );
      logger.log({
        level: 'error',
        message: `Connection debug event triggered. ${JSON.stringify(info)}`,
      });
      stop(message);
    })
    .on('start', () => {
      dispatcher.setVolumeLogarithmic(song.volume / 5);
      playlist.textChannel.send(
        `_loads the record labelled_ **${song.title}** ` +
          `_and turns the volume to_ **${song.volume}**.`,
      );
      playlist.isWriteLocked = false;
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
        playlistOnFinish.connection = null;
        playlistOnFinish.textChannel.send(
          "_lays back in his chair and lights a fresh cigarette._ Alright, I'm stopping. I'll be around.",
        );
        setPlaylist(message, defaultPlaylistName, playlistOnFinish);
        return playlist.voiceChannel?.leave();
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
  if (!message.guild?.id) {
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first.",
    );
  }
  if (!message?.client?.user) {
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions?.has('CONNECT') || !permissions.has('SPEAK')) {
    return message.channel.send(
      'Give me permissions for connecting and speaking in the voice channel, then we can party.',
    );
  }
  const matches = message.content.match(existingTrackPattern);
  const existingTrackNr = parseInt(matches?.[0] ?? '-');
  if (!matches || !isFinite(existingTrackNr)) {
    return message.channel.send(
      'I can only play existing track numbers, like in numbers, or new tracks that must be YouTube links.',
    );
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
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
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `Track ${existingTrackNr} doesn't exist on the **${defaultPlaylistName}** playlist.`,
    );
  }
  const existingTrack = playlist.songs[existingTrackIndex];
  const [previousSong, currentSong, nextSong] = dryRunTraversePlaylistByStep(
    { ...playlist, currentSong: existingTrack },
    1,
  );
  playlist.previousSong = previousSong;
  playlist.currentSong = currentSong;
  playlist.nextSong = nextSong;
  setPlaylist(message, defaultPlaylistName, playlist);
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
    return message.channel.send(
      `I can't seem to join the voice channel to play that track.`,
    );
  }
  playlist.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlist);
  play(message, currentSong);
  return message.channel.send(
    `_ plays track_ ${existingTrackNr} (**${existingTrack.title}**) _with volume at_ **${existingTrack.volume}** _to the list._`,
  );
};

const addTrackToPlaylist = async (
  message: Message,
  title: string,
  url: string,
  trackVolume: number,
) => {
  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
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
    const newPlaylist = await createPlaylist(message, defaultPlaylistName);
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
      console.error(error);
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
  if (!message.guild?.id) {
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first.",
    );
  }
  if (!message?.client?.user) {
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions?.has('CONNECT') || !permissions.has('SPEAK')) {
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

  return message.channel.send(
    `_nods and adds_ **${songInfo.videoDetails.title}** with volume at **${volume}** _to the list._`,
  );
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
  const listOfSongsInAMessage = playlist.songs.reduce(
    (
      eventualSongList: any,
      currentSongDetails,
      index: number,
      songsList: SongShape[],
    ) => {
      const nowPlayingTag = (() => {
        if (
          currentSongDetails.id === currentSongId &&
          currentSongDetails.id === nextSongId &&
          playlist.loop !== 'off'
        ) {
          return '**:arrow_forward: :repeat_one: `Looping this song`** |';
        }
        if (currentSongDetails.id === currentSongId) {
          if (index === songsList.length - 1 && loopType === 'off') {
            return '**:arrow_forward: :eject: `Now playing (last song)`** |';
          }
          return '**:arrow_forward: `Now playing`**';
        }
        if (currentSongDetails.id === nextSongId) {
          if (index === songsList.length - 1 && loopType === 'off') {
            return '**:track_next: :eject: `Up next (last song)`** |';
          }
          return '**:track_next: `Up next`** |';
        }
        return '';
      })();
      const volumeTag = (() => {
        if (currentSongDetails.volume > maxAllowableVolume * 0.75) {
          return `:loud_sound: **${currentSongDetails.volume} / ${maxAllowableVolume}**`;
        }
        if (currentSongDetails.volume > maxAllowableVolume * 0.25) {
          return `:sound: **${currentSongDetails.volume} / ${maxAllowableVolume}**`;
        }
        if (currentSongDetails.volume > 0) {
          return `:speaker: **${currentSongDetails.volume} / ${maxAllowableVolume}**`;
        }
        return `:mute: **${currentSongDetails.volume} / ${maxAllowableVolume}**`;
      })();
      const lines = [
        `${index + 1}. ${nowPlayingTag} ${volumeTag}`,
        `${currentSongDetails.title}`,
        `<${currentSongDetails.url}>`,
      ];
      return `${eventualSongList}\n${lines.join('\n')}\n`;
    },
    `${loopMessages[loopType]} the **${defaultPlaylistName}** playlist:\n`,
  );
  // Discord limit of 2000 in body
  if (listOfSongsInAMessage.length >= 1000) {
    const messages = chunk(listOfSongsInAMessage, 1000);
    for (const msg of messages) {
      await message.channel.send(`\n${msg.join('')}`);
    }
    return;
  }
  return message.channel.send(listOfSongsInAMessage);
};

export const skip = async (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    return message.channel.send(
      'You have to be in a voice channel to stop the music!',
    );
  }
  if (!playlist) {
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
      return message.channel.send(
        `I can't seem to join the voice channel to skip the current song.`,
      );
    }
  }

  playlist.connection.dispatcher.end();
};

export const removeSong = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    return message.channel.send(
      "_looks at the empty playlist queue blankly._ There's nothing to remove.",
    );
  }
  if (!playlist.connection) {
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
  const songNrCandidate = message.content.split(/;rm /)[1];
  const parsedSongNrCandidate = parseInt(songNrCandidate, 10);
  if (!isFinite(parsedSongNrCandidate)) {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `I don't know which song you want me to remove...`,
    );
  }
  const previousCurrentSong = playlist.currentSong;
  const songs = [...playlist.songs];
  const indexOfSongToBeRemoved = songs.findIndex(
    (_, i) => i === parsedSongNrCandidate - 1,
  );
  if (indexOfSongToBeRemoved === -1) {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(`That song doesn't exist on the playlist.`);
  }
  const removedSong = songs[indexOfSongToBeRemoved];
  const updatedSongs = [...songs];
  updatedSongs.splice(parsedSongNrCandidate - 1, 1);
  const [
    nextPreviousSong,
    nextCurrentSong,
    nextNextSong,
  ] = dryRunTraversePlaylistByStep({ ...playlist, songs: updatedSongs }, 1);
  message.channel.send(
    `_removes_ **${removedSong.title}** _from the_ **${defaultPlaylistName}** _playlist and never looks back._`,
  );

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
  setPlaylist(message, defaultPlaylistName, updatedPlaylist);
};

export const loop = (message: Message, loopType?: LoopType) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist?.loop) {
    return message.channel.send(
      "I can't set the loop as there is no playlist or loop setting to begin with.",
    );
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
  message.channel.send(loopOrderedMessages[nextLoopSettingIndex]);
};

export const stop = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    return message.channel.send(
      `I can't stop the **${defaultPlaylistName}** playlist if there isn't a voice channel.`,
    );
  }
  if (!playlist) {
    return message.channel.send('_looks at the empty playlist queue blankly._');
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
    logger.log({
      level: 'error',
      message: `Playlist has no connection to stop the current song.`,
    });
    playlist.voiceChannel?.leave();
    return;
  }
  if (!playlist?.connection.dispatcher) {
    logger.log({
      level: 'error',
      message: `Playlist has no connection dispatcher to stop the current song.`,
    });
    playlist.voiceChannel?.leave();
    return;
  }
  playlist.connection.dispatcher.end();
};

export const clear = async (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    return message.channel.send(
      `I can't stop and clear the **${defaultPlaylistName}** playlist if there isn't a voice channel.`,
    );
  }
  if (!playlist) {
    return message.channel.send(
      `_struggles to find the **${defaultPlaylistName}** playlist._`,
    );
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
      if (!playlist.connection.dispatcher) {
        throw new Error('No dispatcher after joining.');
      }
      setPlaylist(message, defaultPlaylistName, playlist);
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Error occurred while joining the voice channel to clear the playlist: ${error.message}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      return message.channel.send(
        `I can't seem to join the voice channel to clear the playlist.`,
      );
    }
  }

  playlist.connection.dispatcher.end();

  if (playlist.voiceChannel) {
    playlist.voiceChannel?.leave();
  }

  deletePlaylist(message, defaultPlaylistName);
  message.channel.send(
    `_stops the music playing and clears the  **${defaultPlaylistName}** playlist._`,
  );
};

export const setSongVolume = async (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    return message.channel.send('_looks at the empty playlist queue blankly._');
  }

  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Unable to set song volume as write lock is on.`,
    });
    message.channel.send(
      "_raises his hand up in exasperation._ I'll set you volume in good time. Hold that thought for a second.",
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
    return message.channel.send(
      `...Uhh I can only change the volume in terms of digits... you know, like 0 - 10... _he looks away_`,
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
        message: `Error occurred while joining the voice channel to set the volume: ${error.message}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      return message.channel.send(
        `I can't seem to join the voice channel to set the volume.`,
      );
    }
  }

  const prevVolume = playlist.songs[songIndexToSet].volume;

  if (requestedSongIndex === -1) {
    playlist.connection.dispatcher.setVolumeLogarithmic(volume / 5);
  }

  playlist.songs[songIndexToSet].volume = volume;
  setPlaylist(message, defaultPlaylistName, playlist);

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
