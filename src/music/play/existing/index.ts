import { Message } from 'discord.js';
import logger from '../../../logger';
import { reactWithEmoji } from '../../../social';
import { defaultPlaylistName, getPlaylist, setPlaylist } from '../../playlist';
import { play } from '../youtube';

export const playExistingTrack = async (
  message: Message,
  options: { trackNr: number },
) => {
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
  const existingTrackNr = options.trackNr;
  if (!isFinite(existingTrackNr)) {
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
  play(message, { track: existingTrack });
};
