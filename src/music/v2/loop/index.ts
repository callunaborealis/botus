import type { Message } from 'discord.js';

export const loop = (
  message: Message,
  options: { type: 'cycle' | 'off' | 'track' | 'playlist' },
): void => {
  const { type } = options;
  message.reply(`loop ${type}`);
};
