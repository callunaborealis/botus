import { Message } from 'discord.js';
import isArray from 'lodash/isArray';
import isFinite from 'lodash/isFinite';
import isNull from 'lodash/isNull';
import isString from 'lodash/isString';
import { v4 as uuidv4 } from 'uuid';
import ytdl from 'ytdl-core';

import { multiServerSession } from '../constants';
import {
  maxAllowableVolume,
  songScaffold,
  loopOrder,
  loopOrderedMessages,
  volumeBeingSetPattern,
  setSongVolRequests,
  youtubeLinkPattern,
  existingTrackPattern,
} from './constants';
import { LoopType, PlaylistShape, SongShape } from './types';
import { getNextLoopedIndex } from '../utils';
import logger from '../logger';

const defaultPlaylistName = 'default';

const createServerSession = (message: Message) => {
  const serverId = message.guild?.id;
  if (!serverId) {
    return null;
  }
  const serverSession = multiServerSession.get(serverId);
  if (!serverSession) {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
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
    };
    const newServerSession = {
      playlists: {
        [defaultPlaylistName]: newPlaylist,
      },
    };
    multiServerSession.set(serverId, newServerSession);
    return newServerSession;
  }
  return serverSession;
};

const createPlaylist = (message: Message, name: string) => {
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
  };
  if (!multiServerSession.has(serverId)) {
    // This will always run until multi-playlists are supported
    const serverSession = createServerSession(message);
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
      [name]: playlist,
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

  return [prevSong, playlist.songs[indexOfCurrentSong], nextSong, nextNextSong];
};

export const play = (
  message: Message,
  song: SongShape,
  endType: 'stop' | '-' = '-',
) => {
  if (!message.guild?.id) {
    return;
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist || !song) {
    return;
  }
  if (!playlist.connection) {
    playlist.textChannel?.send(
      '_flips his glorious hair and leaves silently._',
    );
    playlist.voiceChannel?.leave();
    return;
  }
  if (endType === 'stop') {
    playlist.textChannel.send(
      "_lays back in his chair and lights a fresh cigarette._ Alright, I'm stopping. I'll be around.",
    );
    playlist.voiceChannel?.leave();
    return;
  }
  if (song.id === songScaffold.id) {
    playlist.textChannel.send(
      "_lays back in his chair and lights a fresh cigarette._ That's all the tracks.",
    );
    playlist.voiceChannel?.leave();
    return;
  }

  const dispatcher = playlist.connection
    .play(ytdl(song.url))
    .on('start', () => {
      dispatcher.setVolumeLogarithmic(song.volume / 5);
      playlist.textChannel.send(
        `_loads the record labelled_ **${song.title}** ` +
          `_and turns the volume to_ **${song.volume}**.`,
      );
    })
    .on('finish', () => {
      const playlistOnFinish = getPlaylist(message, defaultPlaylistName);
      if (!playlistOnFinish) {
        throw new Error('Playlist no longer exists');
      }
      if (playlistOnFinish.stopOnFinish) {
        playlistOnFinish.previousSong = songScaffold;
        playlistOnFinish.currentSong = songScaffold;
        playlistOnFinish.nextSong = songScaffold;
        playlistOnFinish.stopOnFinish = false;
        setPlaylist(message, defaultPlaylistName, playlistOnFinish);
        return play(message, songScaffold, 'stop');
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
    return;
  }
  const existingTrackIndex = playlist.songs.findIndex(
    (_, i) => i === existingTrackNr - 1,
  );
  if (existingTrackIndex === -1) {
    return message.channel.send(
      `Track ${existingTrackIndex} doesn't exist on the **${defaultPlaylistName}** playlist.`,
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
    }
  } catch (error) {
    logger.log({
      level: 'error',
      message: `Error occurred while joining the voice channel: ${error}`,
    });
    return message.channel.send(
      `I can't seem to join the voice channel to play that track.`,
    );
  }
  play(message, currentSong);
  return message.channel.send(
    `_ plays track_ ${existingTrackNr} (**${existingTrack.title}**) _with volume at_ **${existingTrack.volume}** _to the list._`,
  );
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

  const youtubeLinks = message.content.match(youtubeLinkPattern);
  if (!isArray(youtubeLinks)) {
    return message.channel.send("...I can't play _that_.");
  }

  const songInfo = await ytdl.getInfo(youtubeLinks[0]);

  let maxAllowableReached = false;
  const volume = (() => {
    const defaultVolume = 5;
    const volumeMatches = message.content.match(volumeBeingSetPattern);
    if (isArray(volumeMatches)) {
      const volumeOrder = volumeMatches[0];
      if (isString(volumeOrder)) {
        return volumeOrder.split(' ').reduce((prevOrDefault, v) => {
          const candidate = parseFloat(v);
          if (isFinite(candidate) && candidate <= maxAllowableVolume) {
            return candidate;
          }
          if (isFinite(candidate) && candidate > maxAllowableVolume) {
            maxAllowableReached = true;
            return maxAllowableVolume;
          }
          return prevOrDefault;
        }, defaultVolume);
      }
    }
    return defaultVolume;
  })();

  if (maxAllowableReached) {
    message.channel.send(
      `._shakes his head_ I won't play songs louder than a level of **${maxAllowableReached}**.`,
    );
  }

  const song = {
    id: uuidv4(),
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    volume,
  };
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    const newPlaylist = createPlaylist(message, defaultPlaylistName);
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
      logger.log({
        level: 'error',
        message: `Error occurred while creating a new playlist: ${error}`,
      });
      deletePlaylist(message, defaultPlaylistName);
      return message.channel.send(error);
    }
  } else {
    playlist.songs.push(song);
    if (
      !playlist?.currentSong?.id ||
      playlist?.currentSong?.id === songScaffold.id
    ) {
      play(message, song);
    }
    const [previousSong, currentSong, nextSong] = dryRunTraversePlaylistByStep(
      playlist,
      1,
    );
    playlist.previousSong = previousSong;
    playlist.currentSong = currentSong;
    playlist.nextSong = nextSong;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `_nods and adds_ **${song.title}** with volume at **${song.volume}** _to the list._`,
    );
  }
};

/**
 * Shows the playlist
 */
export const list = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist?.currentSong) {
    return message.channel.send("Nothing's playing at the moment.");
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
          return `:speaker: **${currentSongDetails.volume}**`;
        }
        return `:mute: **${currentSongDetails.volume}**`;
      })();
      const lines = [
        `${index + 1}. ${nowPlayingTag} ${volumeTag}`,
        `${currentSongDetails.title}`,
        `<${currentSongDetails.url}>`,
      ];
      return `${eventualSongList}\n${lines.join('\n')}\n`;
    },
    `${loopMessages[loopType]} the default playlist:\n`,
  );
  return message.channel.send(listOfSongsInAMessage);
};

export const skip = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!message?.member?.voice.channel) {
    return message.channel.send(
      'You have to be in a voice channel to stop the music!',
    );
  }
  if (!playlist?.connection) {
    return;
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
  if (!playlist?.connection) {
    return;
  }
  const songNrCandidate = message.content.split(/;rm /)[1];
  const parsedSongNrCandidate = parseInt(songNrCandidate, 10);
  if (!isFinite(parsedSongNrCandidate)) {
    return message.channel.send(
      `I don't know which song you want me to remove...`,
    );
  }
  const songs = [...playlist.songs];
  const indexOfSongToBeRemoved = songs.findIndex(
    (_, i) => i === parsedSongNrCandidate - 1,
  );
  if (indexOfSongToBeRemoved === -1) {
    return message.channel.send(`That song doesn't exist on the playlist.`);
  }
  const removedSong = songs[indexOfSongToBeRemoved];
  const updatedSongs = [...songs];
  updatedSongs.splice(parsedSongNrCandidate - 1, 1);
  const [previousSong, currentSong, nextSong] = dryRunTraversePlaylistByStep(
    { ...playlist, songs: updatedSongs },
    1,
  );
  const updatedPlaylist = {
    ...playlist,
    previousSong,
    currentSong,
    nextSong,
    songs: updatedSongs,
  };
  setPlaylist(message, defaultPlaylistName, updatedPlaylist);
  message.channel.send(
    `_removes_ **${removedSong.title}** _from the_ **${defaultPlaylistName}** _playlist and never looks back._`,
  );
  if (updatedSongs.length === 0 || currentSong?.id === removedSong.id) {
    playlist.connection.dispatcher.end();
  }
};

export const loop = (message: Message, loopType?: LoopType) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist?.loop) {
    return message.channel.send(
      "I can't set the loop as there is no playlist or loop setting to begin with.",
    );
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
  playlist.stopOnFinish = true;
  setPlaylist(message, defaultPlaylistName, playlist);
  if (!playlist?.connection) {
    return;
  }
  playlist.connection.dispatcher.end();
};

export const clear = (message: Message) => {
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
  playlist.songs = [];
  playlist.previousSong = songScaffold;
  playlist.currentSong = songScaffold;
  playlist.nextSong = songScaffold;
  setPlaylist(message, defaultPlaylistName, playlist);
  if (!playlist?.connection) {
    return;
  }
  playlist.connection.dispatcher.end();
  deletePlaylist(message, defaultPlaylistName);
  message.channel.send(
    `_stops the music playing and clears the  **${defaultPlaylistName}** playlist._`,
  );
};

export const setSongVolume = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    return message.channel.send('_looks at the empty playlist queue blankly._');
  }
  if (!playlist?.connection) {
    return;
  }
  const volume: any = (() => {
    if (message.content.match(setSongVolRequests[0])) {
      const volumeToSetForCurrentSong: any = parseFloat(
        message.content.split(/^;v/)[0],
      );
      if (!isFinite(volumeToSetForCurrentSong)) {
        return volumeToSetForCurrentSong;
      }
    }
    return '-';
  })();

  if (volume > maxAllowableVolume) {
    return message.channel.send(
      `._shakes his head_ I won't play songs louder than a volume level of **${maxAllowableVolume}**.`,
    );
  }

  if (volume === '-') {
    return message.channel.send(
      `...Uhh I can only change the volume in terms of digits... you know, like 0 - 10... _he looks away_`,
    );
  }

  playlist.connection.dispatcher.setVolumeLogarithmic(volume / 5);
  const indexOfCurrentSong = playlist.songs.findIndex(
    (s) => s.id === playlist.currentSong.id,
  );
  const prevVolume = playlist.songs[indexOfCurrentSong].volume;
  playlist.songs[indexOfCurrentSong].volume = volume;
  setPlaylist(message, defaultPlaylistName, playlist);
  return message.channel.send(
    `Volume for this song changed from ~~${prevVolume} / ${maxAllowableVolume}~~ to ${volume} / ${maxAllowableVolume}.`,
  );
};
