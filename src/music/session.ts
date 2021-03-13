import { Message, Snowflake } from 'discord.js';
import { clear } from '.';
import { reactWithEmoji } from '../social';
import { defaultPlaylistName, generateEmptyPlaylist } from './playlist';
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

  if (!serverSession) {
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      return null;
    }

    const newPlaylist: PlaylistShape = generateEmptyPlaylist({
      textChannel: message.channel,
      voiceChannel,
    });
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
    await clear(message);
    if (serverSession.playlists[defaultPlaylistName]) {
      delete serverSession.playlists[defaultPlaylistName];
    }
    const newPlaylist: PlaylistShape = generateEmptyPlaylist({
      textChannel: message.channel,
      voiceChannel: message.member?.voice.channel,
    });
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
