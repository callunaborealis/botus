import type { Message } from 'discord.js';

export const playExistingTrack = (
  message: Message,
  options: { trackNr: number },
): void => {
  const { trackNr } = options;
  message.reply(`playExistingTrack ${trackNr}`);
};
