import type { Message } from 'discord.js';

export const stop = (message: Message): void => {
  message.reply('stop');
};
