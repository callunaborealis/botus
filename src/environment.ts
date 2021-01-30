import dotenv from 'dotenv';
dotenv.config({ path: `${__dirname}/../.env` });

export const SERVER_APP_PORT = process.env.SERVER_APP_PORT || 3000;
export const DISCORD_APP_BOT_TOKEN = process.env.DISCORD_APP_BOT_TOKEN || '---';
