import type { Message } from 'discord.js';

export const getTrackNrFromRmSongCommand = (
  matches: (string | undefined)[],
) => {
  if (!matches[1]) {
    return 'current';
  }
  const t = parseInt(matches[1]);
  if (!Number.isNaN(t)) {
    return t;
  }
  return 'current';
};

export const remove = (
  message: Message,
  options: { trackNr: number | 'current' },
): void => {
  const { trackNr } = options;
  message.reply(`remove ${trackNr}`);
};
