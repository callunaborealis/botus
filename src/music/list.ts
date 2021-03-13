import { Message, MessageEmbed } from 'discord.js';
import { defaultPlaylistName, getPlaylist } from './playlist';

export const showPlaylistPrefixCommands = [
  /**
   * /^;(q|queue|(play)?list)(( (pg?|page))?( [\d]+)| ((everything|all)))?( |$)/gim
   */
  'playlist',
  'queue',
  'play',
  'q',
];
const showPlaylistPrefixCommandPattern = `(?:${showPlaylistPrefixCommands.join(
  '|',
)})`;
export const showPlaylistPrefixCommandPatterns = [
  new RegExp([showPlaylistPrefixCommandPattern].join('')),
];

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
    requestedPage: 1,
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
