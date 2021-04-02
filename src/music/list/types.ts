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

export type ListPrefixCommandMatches = [
  [
    beforeText: string,
    separator1: undefined, // Empty
    pageNr: string | undefined, // Capture 4 from track 4
    afterText: string,
  ],
];

export type ExtractedPlaylistPageType = number | 'current' | 'all';

export type ListNaturalRequestMatches = [
  [
    beforeText: string,
    // show page 2 of this playlist
    pageNr: string | undefined,
    // show 2nd page of this playlist
    pageNr: string | undefined,
    // show this playlist page 2
    pageNr: string | undefined,
    // show this playlist 2nd page
    pageNr: string | undefined,
    // show the page 2 of this playlist
    pageNr: string | undefined,
    // show the 2nd page of this playlist
    pageNr: string | undefined,
    afterText: string,
  ],
];
