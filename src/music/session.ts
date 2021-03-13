import { Message, Snowflake } from 'discord.js';
import { clear } from '.';
import { reactWithEmoji } from '../social';
import { songScaffold } from './constants';
import { defaultPlaylistName } from './playlist';
import { PlaylistShape } from './types';

const multiServerSession: Map<
  Snowflake,
  {
    playlists: Record<string, PlaylistShape>;
  }
> = new Map();

const createServerSession = async (
  message: Message,
  shouldReset: boolean = false,
) => {
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
      disconnectOnFinish: false,
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
  if (shouldReset) {
    const candidates = message.content.split(/;(forcereset|hardreset) /gim);
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
    reactWithEmoji.succeeded(message);
    return newServerSession;
  }
  return serverSession;
};

export { createServerSession, multiServerSession };
