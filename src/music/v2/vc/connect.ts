import type { Message } from 'discord.js';

export const connect = (message: Message): void => {
  message.reply('connect');
};
