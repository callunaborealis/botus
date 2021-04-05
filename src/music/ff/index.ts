import { Message } from 'discord.js';
import floor from 'lodash/floor';
import isNil from 'lodash/isNil';

import logger from '../../logger';
import { reactWithEmoji } from '../../social';
import { songScaffold } from '../constants';
import { play } from '../play/youtube';
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
  const streamTime = playlist.connection?.dispatcher?.streamTime ?? 0;
  const streamTotalSecs = floor(streamTime / 1000);
  const duration = floor(playlist.currentSong.duration);
  const ffDuration = (() => {
    if (streamTotalSecs + 10 < duration) {
      return streamTotalSecs + 5;
    }
    return 0;
  })();
  play(message, { ff: ffDuration, track: playlist.currentSong });
};
