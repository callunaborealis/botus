import type { Message } from 'discord.js';

export const fastForward = (message: Message): void => {
  message.reply(`fastForward`);
};
