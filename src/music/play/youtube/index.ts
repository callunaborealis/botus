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
