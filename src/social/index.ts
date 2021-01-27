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
