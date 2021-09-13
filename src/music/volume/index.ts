import { Message } from 'discord.js';
import { isNil } from 'lodash';
import isString from 'lodash/isString';
import logger from '../../logger';
import { reactWithEmoji } from '../../social';
import { maxAllowableVolume } from '../constants';
import { defaultPlaylistName, getPlaylist, setPlaylist } from '../playlist';

import { ExtractedVolumeDetails, TrackVolNaturalRequestMatches } from './types';

export const extractNaturalSetVolumeDetails = (options: {
  index: number;
  matches: (string | undefined)[];
}): ExtractedVolumeDetails => {
  if (options.index === 0) {
    const matches = options.matches as TrackVolNaturalRequestMatches[0];
    return matches.reduce(
      (eventual, match, index) => {
        // Up
        if (!match || !isString(match)) {
          return eventual;
        }
        if (index === 1) {
          return {
            ...eventual,
            volActionType: 'prefix',
            volActionVerb: match,
            volAction: 'up',
          } as ExtractedVolumeDetails;
        }
        if (index === 2) {
          return {
            ...eventual,
            volActionType: 'sandwich',
            volActionVerb: match,
            volAction: 'up',
          } as ExtractedVolumeDetails;
        }
        // Down
        if (index === 3) {
          return {
            ...eventual,
            volActionType: 'prefix',
            volActionVerb: match,
            volAction: 'down',
          } as ExtractedVolumeDetails;
        }
        if (index === 4) {
          return {
            ...eventual,
            volActionType: 'sandwich',
            volActionVerb: match,
            volAction: 'down',
          } as ExtractedVolumeDetails;
        }

        if (index === 5) {
          return {
            ...eventual,
            volActionType: 'prefix',
            volActionVerb: match,
            volAction: 'neutral',
          } as ExtractedVolumeDetails;
        }

        if (index === 6) {
          return {
            ...eventual,
            volumeType: 'absolute',
          } as ExtractedVolumeDetails;
        }
        if (index === 7) {
          return {
            ...eventual,
            volumeType: 'relative',
          } as ExtractedVolumeDetails;
        }
        if (index === 8) {
          return {
            ...eventual,
            volume: parseFloat(match),
          } as ExtractedVolumeDetails;
        }

        if (index === 9 || index === 10) {
          return {
            ...eventual,
            track: parseInt(match, 10),
          } as ExtractedVolumeDetails;
        }
        return eventual;
      },
      {
        playlist: 'default',
        track: 'current',
        volume: 5,
        volumeType: 'absolute',
        volActionVerb: '',
        volAction: 'neutral',
      } as ExtractedVolumeDetails,
    );
  }
  return {
    playlist: '-',
    track: 'current',
    volume: 0,
    volumeType: 'absolute',
    volActionType: 'prefix',
    volActionVerb: '',
    volAction: 'neutral',
  };
};

export const setSongVolume = async (
  message: Message,
  options?: {
    volume: string;
    track?: string;
  },
) => {
  reactWithEmoji.received(message);
  const playlist = getPlaylist(message, defaultPlaylistName);
  if (!playlist) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Playlist not found while setting track volume. - ${defaultPlaylistName}`,
    });
    return;
  }

  if (playlist.isWriteLocked) {
    logger.log({
      level: 'error',
      message: `Unable to set song volume as write lock is on.`,
    });
    message.channel.send(
      "_raises his hand up in exasperation._ I'll set your volume in good time. Hold that thought for a second.",
    );
    return;
  }

  playlist.isWriteLocked = true;
  setPlaylist(message, defaultPlaylistName, playlist);

  const requestedSongIndex = (() => {
    const receivedTrack = parseInt(options?.track ?? '-', 10);
    if (isFinite(receivedTrack)) {
      if (playlist.songs[receivedTrack - 1]) {
        // Song exists in songs
        return receivedTrack - 1;
      }
      message.channel.send(
        `_shrugs_ I couldn't find the track number ${receivedTrack} on the playlist.`,
      );
    }
    /**
     * @deprecated
     */
    const candidates = message.content.match(/ (track|song|t|s) [\d]+/gim);
    if (candidates && candidates[0]) {
      const songNr = parseInt(
        candidates[0].split(/ (track|song|t|s) /gim)[2],
        10,
      );
      if (isFinite(songNr)) {
        if (playlist.songs[songNr - 1]) {
          // Song exists in songs
          return songNr - 1;
        }
        message.channel.send(
          `_shrugs_ I couldn't find the track number ${songNr} on the playlist.`,
        );
      }
    }
    return -1;
  })();

  const currentSongIndex = playlist.songs.findIndex(
    (s) => s.id === playlist.currentSong.id,
  );

  const songIndexToSet =
    requestedSongIndex === -1 ? currentSongIndex : requestedSongIndex;

  const volume: number | '-' = (() => {
    const volumeToSetForCurrentSong = (() => {
      const receivedVolume = parseFloat(options?.volume ?? '-');
      if (isFinite(receivedVolume)) {
        return receivedVolume;
      }
      /**
       * @deprecated
       */
      const volShortCutMentions = message.content.match(
        /(^;v) [\d]+(\.\d+)?([ ?]|$)/gim,
      );

      if (volShortCutMentions && volShortCutMentions[0]) {
        return parseFloat(volShortCutMentions[0].split(/(^;v) /gim)[2]);
      }
      /**
       * @deprecated
       */
      const volumeMentions = message.content.match(
        / vol(\.|ume)? ?(as|at|to|with|using)? [\d]+(\.\d+)?([ ?]|$)/gim,
      );

      if (volumeMentions && volumeMentions[0]) {
        return parseFloat(
          volumeMentions[0].split(
            /vol(\.|ume)? ?(as|at|to|with|using)? /gim,
          )[3],
        );
      }
      return null;
    })();

    if (isFinite(volumeToSetForCurrentSong as number)) {
      return volumeToSetForCurrentSong as number;
    }
    return '-';
  })();

  if (volume > maxAllowableVolume) {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    return message.channel.send(
      `_shakes his head_ I won't play songs louder than a volume level of **${maxAllowableVolume}**.`,
    );
  }

  if (volume === '-') {
    playlist.isWriteLocked = false;
    setPlaylist(message, defaultPlaylistName, playlist);
    reactWithEmoji.failed(message);
    return;
  }

  if (!playlist.connection?.dispatcher) {
    const voiceChannel = message.member?.voice.channel;
    try {
      if (!voiceChannel) {
        throw new Error('No voice channel.');
      }
      if (!voiceChannel.joinable) {
        throw new Error('Voice channel not joinable.');
      }
      const connection = await voiceChannel.join();
      playlist.connection = connection;
      if (isNil(playlist.connection)) {
        throw new Error('Playlist connection invalid after joining.');
      }
      if (!playlist.connection.dispatcher) {
        throw new Error('No dispatcher after joining.');
      }
      setPlaylist(message, defaultPlaylistName, playlist);
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Error occurred while joining the voice channel to set the volume: ${error}`,
      });
      playlist.isWriteLocked = false;
      setPlaylist(message, defaultPlaylistName, playlist);
      reactWithEmoji.failed(message);
      return;
    }
  }

  if (!playlist.songs[songIndexToSet]) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `Unable to find song to set current volume.`,
    });
    return;
  }

  const prevVolume = playlist.songs[songIndexToSet].volume;

  if (requestedSongIndex === -1) {
    if (!playlist.connection.dispatcher) {
      reactWithEmoji.failed(message);
      logger.log({
        level: 'error',
        message: `Unable to find dispatcher to set volume of current track.`,
      });
      return;
    }
    playlist.connection.dispatcher.setVolumeLogarithmic(volume / 5);
  }

  playlist.songs[songIndexToSet].volume = volume;
  setPlaylist(message, defaultPlaylistName, playlist);
  reactWithEmoji.succeeded(message);

  const songName = (() => {
    if (requestedSongIndex !== -1) {
      return `track ${requestedSongIndex + 1} (**${
        playlist.songs[songIndexToSet].title
      }**)`;
    }
    return `the current song`;
  })();

  return message.channel.send(
    `Volume for ${songName} changed from ~~${prevVolume} / ${maxAllowableVolume}~~ to ${volume} / ${maxAllowableVolume}.`,
  );
};
