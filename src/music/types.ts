import { GuildMember, Message } from 'discord.js';

export interface SongShape {
  id: string;
  title: string;
  url: string;
  volume: number;
}

export interface QueueShape {
  textChannel: Message['channel'];
  voiceChannel: GuildMember['voice']['channel'];
  connection: GuildMember['voice']['connection'] | null;
  songs: SongShape[];
  volume: number;
  currentSong: SongShape | null;
  previousSong: SongShape | null;
}
