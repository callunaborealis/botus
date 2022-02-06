import type { Message } from 'discord.js';

export const setVolume = (
  message: Message,
  options: {
    volume: string | undefined;
    track: string | undefined;
  },
): void => {
  const { volume, track } = options;
  message.reply(`setVolume: ${volume},${track}`);
};
