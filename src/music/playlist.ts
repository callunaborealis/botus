import { Message } from 'discord.js';
import logger from '../logger';
import { songScaffold } from './constants';
import { createServerSession, multiServerSession } from './session';
import { PlaylistShape } from './types';

export const defaultPlaylistName = 'default';

export const createPlaylist = async (
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

export const getPlaylist = (message: Message, name: string) => {
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

export const deletePlaylist = (message: Message, name: string) => {
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
