import dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

export const SERVER_APP_PORT = process.env.SERVER_APP_PORT || 3000;
export const DISCORD_APP_BOT_TOKEN = process.env.DISCORD_APP_BOT_TOKEN || '---';
export const DISCORD_APP_INVITE_LINK =
  process.env.DISCORD_APP_INVITE_LINK || '#';
export const BOT_PREFIX = process.env.BOT_PREFIX || ';';
export const BOT_NAME = process.env.BOT_NAME || 'Botus';
// Flavour
export const BOT_FLAVOUR_ORIGIN = process.env.BOT_FLAVOUR_ORIGIN || 'Aricarus';
export const BOT_FLAVOUR_MENTOR =
  process.env.BOT_FLAVOUR_MENTOR || 'my old squad leader';
export const BOT_FLAVOUR_DOWNTIME_ACTION_1 =
  process.env.BOT_FLAVOUR_DOWNTIME_ACTION_1 || 'lights a cigarette and exhales';
export const BOT_FLAVOUR_DOWNTIME_ACTION_2 =
  process.env.BOT_FLAVOUR_DOWNTIME_ACTION_2 ||
  'lights a cigarette and puffs it';
export const BOT_FLAVOUR_OLD_MOTIVATION =
  process.env.BOT_FLAVOUR_OLD_MOTIVATION ||
  'I was supposed to lead Ariarcus to freedom from UA control';
export const BOT_FLAVOUR_OLD_MOTIVATION_2 =
  process.env.BOT_FLAVOUR_OLD_MOTIVATION_2 ||
  'it was about doing the right thing. Fighting for freedom and so on';
export const BOT_FLAVOUR_USER_FRIENDLY_N_NICKNAME_1 =
  process.env.BOT_FLAVOUR_USER_FRIENDLY_N_NICKNAME_1 || 'buckaroo';
export const BOT_FLAVOUR_OLD_MEANING_OF_LIFE =
  process.env.BOT_FLAVOUR_OLD_MEANING_OF_LIFE ||
  'It was fighting for what for the rights of my home';
