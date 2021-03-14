import { Message } from 'discord.js';
import isNil from 'lodash/isNil';
import logger from '../../logger';
import { reactWithEmoji } from '../../social';
import { dryRunTraversePlaylistByStep } from '../helper';
import { defaultPlaylistName, getPlaylist, setPlaylist } from '../playlist';

export const getTrackNrFromRmSongCommand = (
  matches: (string | undefined)[],
) => {
  if (!matches[1]) {
    return 'current';
  }
  const t = parseInt(matches[1]);
  if (isFinite(t)) {
    return t;
  }
  return 'current';
};

export const removeSong = (
  message: Message,
  options: { trackNr: number | 'current' },
) => {
  const { trackNr } = options;
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "_looks at the empty playlist queue blankly._ There's nothing to remove.",
    );
  }
  if (isNil(playlist.connection)) {
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

  const songs = [...playlist.songs];
  const indexOfSongToBeRemoved = (() => {
    if (trackNr === 'current') {
      return songs.findIndex((song) => song.id === playlist.currentSong.id);
    }
    return songs.findIndex((_, i) => i === trackNr - 1);
  })();

  const previousCurrentSong = playlist.currentSong;

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
  updatedSongs.splice(indexOfSongToBeRemoved, 1);
  const [
    nextPreviousSong,
    nextCurrentSong,
    // Legacy bug: Play next song if current song instead of first song in the playlist
    nextNextSong,
  ] = dryRunTraversePlaylistByStep({ ...playlist, songs: updatedSongs }, 1);
  const updatedPlaylist = {
    ...playlist,
    previousSong: nextPreviousSong,
    currentSong: nextCurrentSong,
    nextSong: nextNextSong,
    songs: updatedSongs,
    isWriteLocked: false,
  };

  if (updatedSongs.length === 0 || previousCurrentSong?.id === removedSong.id) {
    setPlaylist(message, defaultPlaylistName, updatedPlaylist);

    if (playlist.connection.dispatcher) {
      playlist.connection.dispatcher.end();
    }
  }

  reactWithEmoji.succeeded(message);
  setPlaylist(message, defaultPlaylistName, updatedPlaylist);
  message.channel.send(
    `_removes_ **${removedSong.title}** _from the_ **${defaultPlaylistName}** _playlist and never looks back._`,
  );
};
