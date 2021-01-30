import { Message } from 'discord.js';

import isArray from 'lodash/isArray';
import random from 'lodash/random';

export const interpretRequest = (message: Message, listOfMatches: RegExp[]) => {
  let matched = false;
  for (let i = 0; i < listOfMatches.length; i++) {
    const pattern = new RegExp(listOfMatches[i]);
    const matches = message.content.match(pattern);
    if (isArray(matches) && matches.length > 0) {
      matched = true;
      break;
    }
  }
  return matched;
};

// Don't mention the user
export const respond = (
  message: Message,
  listOfResponses: ((username: string) => string)[],
) => {
  const i = random(0, listOfResponses.length - 1);
  const responseChoice = listOfResponses[i];
  return message.channel.send(responseChoice(message.author.username));
};

export const reply = (message: Message, reply: string) => {
  return message.reply(reply);
};

export const sendHelpDoc = (message: Message) => {
  return message.channel.send(
    [
      '',
      '**Music**',
      'I\'m like Groovy but with a ";" instead of a "-" prefix.',
      '',
      '`;p {youtube link}`   -- Plays / Adds a track to the playlist',
      '`;p {youtube link} at vol 5`   -- Plays / Adds a track to the playlist with volume set',
      '`botus play/add {youtube link}`    -- Plays / Adds a track to the playlist',
      '`botus play/add {youtube link} at volume 4`    -- Plays / Adds a track to the playlist with volume set',
      '`;rm {track number}`   -- Removes a track by number. Removing the current track skips or ends the playlist.',
      '`;q`   -- Show what is being played',
      '`;l`   -- Loop (cycle)',
      '`;lq` | `;loop queue` | `;lp`    -- Loop (playlist)',
      '`;loop track` | `;ls` | `;lt` | `;loop song`   -- Loop (song)',
      '`;loop stop`   -- Loop (Off)',
      '`;v {volume}`    -- Change volume of current track to volume given',
      '`;clear`   -- Stop and clears the playlist',
      '`;h` | `;help` | `botus help`    -- Displays this help message',
    ].join('\n'),
  );
};
