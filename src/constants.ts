import { Snowflake } from 'discord.js';
import { ServerSessionShape } from './types';

export const multiServerSession: Map<Snowflake, ServerSessionShape> = new Map();
