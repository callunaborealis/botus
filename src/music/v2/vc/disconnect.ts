import type { Message } from 'discord.js';

export const disconnect = (message: Message): void => {
  message.reply('disconnect');
};
