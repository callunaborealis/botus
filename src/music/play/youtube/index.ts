import { Message } from 'discord.js';
import ytdl from 'ytdl-core';
import isNil from 'lodash/isNil';

import logger from '../../../logger';
import { reactWithEmoji } from '../../../social';
import { defaultPlaylistName, getPlaylist, setPlaylist } from '../../playlist';
import { SongShape } from '../../types';
import { dryRunTraversePlaylistByStep } from '../../helper';
import { maxAllowableVolume, songScaffold } from '../../constants';
import { stop } from '../..';

export const onDebug = (message: Message, options: { info: string }) => {
  const { info } = options;
  logger.log({
    level: 'error',
    message: `Connection debug event triggered. ${JSON.stringify(info)}`,
  });
  reactWithEmoji.failed(message);
  stop(message);
};

export const onConnectionFinish = (message: Message) => {
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
  const [_, currentSong, nextSong, nextNextSong] = dryRunTraversePlaylistByStep(
    playlistOnFinish,
    1,
  );
  playlistOnFinish.previousSong = currentSong;
  playlistOnFinish.currentSong = nextSong;
  playlistOnFinish.nextSong = nextNextSong;
  playlistOnFinish.isWriteLocked = false;
  setPlaylist(message, defaultPlaylistName, playlistOnFinish);
  play(message, { track: nextSong });
};

export const play = (
  message: Message,
  options: {
    track: SongShape;
  },
) => {
  const { track } = options;
  if (!message.guild?.id) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No guild ID found while attempting to play a track.`,
    });
    return;
  }
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist || !track) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No playlist or track found while attempting to play a track.`,
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

  if (track.id === songScaffold.id) {
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
    .play(ytdl(track.url, { filter: 'audioonly', highWaterMark: 1 << 25 }))
    .on('debug', (info) => {
      onDebug(message, { info });
    })
    .on('start', () => {
      dispatcher.setVolumeLogarithmic(track.volume / 5);
      playlist.textChannel.send(
        `Playing **${track.title}** (Volume: ${track.volume} / ${maxAllowableVolume}).`,
      );
      playlist.isWriteLocked = false;
      const [
        previousSong,
        currentSong,
        nextSong,
      ] = dryRunTraversePlaylistByStep({ ...playlist, currentSong: track }, 1);
      playlist.previousSong = previousSong;
      playlist.currentSong = currentSong;
      playlist.nextSong = nextSong;
      reactWithEmoji.succeeded(message);
      setPlaylist(message, defaultPlaylistName, playlist);
    })
    .on('finish', () => {
      onConnectionFinish(message);
    })
    .on('error', (error: any) => {
      logger.log({
        level: 'error',
        message: `Error occurred while playing song: ${error}`,
      });
    });
};
