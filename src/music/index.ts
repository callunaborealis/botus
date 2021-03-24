import { Message } from 'discord.js';
import ytdl from 'ytdl-core';

import isNil from 'lodash/isNil';

import { reactWithEmoji } from '../social';
import {
  maxAllowableVolume,
  songScaffold,
  loopOrder,
  loopOrderedMessages,
} from './constants';
import {
  createPlaylist,
  defaultPlaylistName,
  deletePlaylist,
  getPlaylist,
  setPlaylist,
} from './playlist';
import { LoopType, SongShape } from './types';
import { getNextLoopedIndex } from '../utils';
import logger from '../logger';
import { dryRunTraversePlaylistByStep } from './helper';

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

  if (isNil(playlist.connection)) {
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
    if (isNil(playlist.connection)) {
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
      if (isNil(playlist.connection)) {
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
      if (isNil(playlist.connection)) {
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
