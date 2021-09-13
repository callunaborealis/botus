import { Message } from 'discord.js';
import { isNil } from 'lodash';
import isNull from 'lodash/isNull';
import { v4 as uuidv4 } from 'uuid';
import { play } from '.';

import logger from '../../../logger';
import { reactWithEmoji } from '../../../social';
import { songScaffold } from '../../constants';
import { dryRunTraversePlaylistByStep } from '../../helper';
import {
  createPlaylist,
  defaultPlaylistName,
  getPlaylist,
  setPlaylist,
} from '../../playlist';

export const addTrackToPlaylist = async (options: {
  duration: number;
  message: Message;
  title: string;
  trackVolume: number;
  url: string;
}) => {
  const { duration, message, title, trackVolume, url } = options;
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
    duration,
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
      play(message, { track: song });
    } catch (error) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Error occurred while creating a new playlist: ${error}`,
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
    // Need to check if playlist.connection = null
    if (isNil(playlist.connection)) {
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      setPlaylist(message, defaultPlaylistName, playlist);
    }
    play(message, { track: song });
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
