import { PlaylistShape } from './music/types';

export interface ServerSessionShape {
  playlists: Record<string, PlaylistShape>;
}
