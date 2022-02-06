import type { Message } from 'discord.js';

export const clear = (message: Message): void => {
  message.reply(`clear`);
};
