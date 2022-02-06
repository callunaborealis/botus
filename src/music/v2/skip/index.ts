import type { Message } from 'discord.js';

export const skip = (message: Message): void => {
  message.reply('skip');
};
