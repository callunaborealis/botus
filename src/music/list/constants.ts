export const showPlaylistPrefixCommands = [
  /**
   * /^;(q|queue|(play)?list)(( (pg?|page))?( [\d]+)| ((everything|all)))?( |$)/gim
   */ // Groovy aliases
  'queue',
  'q',
  'playlist',
  'list',
];

const showPlaylistPrefixCommandPattern = `(?:${showPlaylistPrefixCommands.join(
  '|',
)})`;

export const showPlaylistPrefixCommandPatterns = [
  new RegExp(['(?:', showPlaylistPrefixCommandPattern, ')'].join('')),
];
