import { GuildMember, Message } from 'discord.js';

export interface SongShape {
  id: string;
  title: string;
  url: string;
  volume: number;
}

export type LoopType = 'song' | 'playlist' | 'off';

export interface PlaylistShape {
  textChannel: Message['channel'];
  voiceChannel: GuildMember['voice']['channel'];
  connection: GuildMember['voice']['connection'];
  songs: SongShape[];
  volume: number;
  currentSong: SongShape;
  previousSong: SongShape;
  nextSong: SongShape;
  loop: LoopType;
  /**
   * Indicates to stop playlist on dispatcher
   * end event
   */
  stopOnFinish: boolean;
  /**
   * Simple write blocking signal
   * to prevent conflicting read/writes
   */
  isWriteLocked: boolean;
}
