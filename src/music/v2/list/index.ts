import type { Message } from 'discord.js';
import { ExtractedPlaylistPageType } from '../../v1/list/types';

export const list = (
  message: Message,
  options: {
    pageNrRequested?: ExtractedPlaylistPageType;
  },
): void => {
  const { pageNrRequested } = options;
  message.reply(`list ${pageNrRequested}`);
};
