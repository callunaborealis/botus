import { EmbedFieldData } from 'discord.js';
import { SongShape } from '../types';

export interface ListedTrackShape extends SongShape {
  isCurrent: boolean;
  isNext: boolean;
}

interface PlaylistPageEmbedShape {
  title: string;
  description?: string;
  fields: EmbedFieldData[];
}

export interface DisplayedPlaylistShape {
  pages: PlaylistPageEmbedShape[];
  currentPageIndex: number;
}

export type ListPrefixCommandMatches = [];
