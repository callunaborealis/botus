import { Message } from 'discord.js';
import isNil from 'lodash/isNil';
import logger from '../../logger';
import { reactWithEmoji } from '../../social';

import { songScaffold } from '../constants';
import { defaultPlaylistName, getPlaylist } from '../playlist';

export const fastForward = (message: Message) => {
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (
    isNil(playlist) ||
    playlist.songs.length === 0 ||
    playlist.currentSong.id === songScaffold.id
  ) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Unable to find playlist to fast forward track.`,
    });
    return;
  }
  if (isNil(playlist.connection)) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Unable to find connection to fast forward track.`,
    });
    return;
  }
};
