import { Message, MessageEmbed } from 'discord.js';
import { defaultPlaylistName, getPlaylist } from './playlist';

const generateDisplayedPlaylistPages = (params: {
  messageContent: string;
  page?: number | 'all';
}) => {
  const { messageContent, page } = params;
  return [];
};

export const list = async (
  message: Message,
  options: { page?: number | 'all' },
) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  const pages = generateDisplayedPlaylistPages({
    messageContent: '',
    page: 1,
  });
  let actualCurrentPageIndex = 0;
  for (const page of pages) {
    const playlistPageEmbed = new MessageEmbed();
    await message.channel.send(playlistPageEmbed);
    actualCurrentPageIndex = actualCurrentPageIndex + 1;
  }
};
