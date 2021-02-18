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
      'This might help.',
      '**Music**',
      'I\'m like Groovy but with a ";" instead of a "-" prefix.',
      '',
      '`;p {youtube link/playlist}` | `;play {youtube link/playlist}`   -- Plays / Adds a track or playlist to the playlist',
      '`;p {youtube link} at vol 5` | `;play {youtube link/playlist} at vol 5`   -- Plays / Adds a track or playlist to the playlist with volume set',
      '`;p 2` | `;play 2` | `;play track 2`   -- Plays an existing track',
      '`;q track 2`   -- Plays an existing track already on the playlist',
      '`;join`   -- Joins the voice channel',
      '`;leave` | `;bye` | `;dc`   -- Disconnects from the voice channel',
      '`botus play/add {youtube link/playlist}`    -- Plays / Adds a YouTube track or playlist to the playlist',
      '`botus play/add {youtube link/playlist} at volume 4`    -- Plays / Adds a YouTube track or playlist to the playlist with volume set. The same volume will be applied to all newly added tracks.',
      '`;rm {track number}`   -- Removes a track by number. Removing the current track skips or ends the playlist.',
      '`;q` | `;q {page number}` | `;q page {page number}`   -- Shows the playlist. Page where current track is playing is shown if no page number is declared. If no current track, it will use the first page.',
      '`;l` | `;loop`   -- Loop (cycle)',
      '`;lq` | `;loop queue` | `;lp`    -- Loop (playlist)',
      '`;loop track` | `;ls` | `;lt` | `;loop song` | `;repeat`   -- Loop (song)',
      '`;loop stop` | `;loopstop` | `;loop off` | `;loopoff`   -- Loop (Off)',
      '`;v {volume}`    -- Change volume of current track to volume given',
      '`;clear`   -- Stop and clears the playlist',
      '`;h` | `;help` | `botus help`    -- Displays this help message',
    ].join('\n'),
  );
};
