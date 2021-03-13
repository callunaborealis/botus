import { Message, MessageEmbed } from 'discord.js';
import { defaultPlaylistName, getPlaylist } from '../playlist';

export const generateDisplayedPlaylistPages = (params: {
  messageContent: string;
  requestedPage?: number | 'all';
}) => {
  const { messageContent, requestedPage } = params;
  return [];
};

export const list = async (
  message: Message,
  options: { requestedPage?: number | 'all' },
) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  const pages = generateDisplayedPlaylistPages({
    messageContent: '',
    requestedPage: options.requestedPage,
  });
  let actualCurrentPageIndex = 0;
  for (const page of pages) {
    const playlistPageEmbed = new MessageEmbed().setAuthor(
      message.author.username,
      message.author.avatar ?? undefined,
    );
    await message.channel.send(playlistPageEmbed);
    actualCurrentPageIndex = actualCurrentPageIndex + 1;
  }
};
