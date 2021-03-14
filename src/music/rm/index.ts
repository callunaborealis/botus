import { Message } from 'discord.js';
import { isNil } from 'lodash';
import logger from '../../logger';
import { reactWithEmoji } from '../../social';
import { dryRunTraversePlaylistByStep } from '../helper';
import { defaultPlaylistName, getPlaylist, setPlaylist } from '../playlist';

export const removeSong = (message: Message) => {
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
