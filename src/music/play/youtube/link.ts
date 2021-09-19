import { Message } from 'discord.js';
import ytpl from 'ytpl';
import ytdl from 'ytdl-core';
import isFinite from 'lodash/isFinite';

import logger from '../../../logger';
import { reactWithEmoji } from '../../../social';
import { maxAllowableVolume } from '../../constants';
import { getYoutubeLinkAndVolFromRequest } from '../../helper';
import { addTrackToPlaylist } from './helper';

export const playAndOrAddYoutubeToPlaylist = async (message: Message) => {
  reactWithEmoji.received(message);
  if (!message.guild?.id) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No guild ID found while attempting to play and or add an existing YouTube link.`,
    });
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      "I'm not gonna play for no one. Someone get into a voice channel first.",
    );
  }
  if (!message?.client?.user) {
    reactWithEmoji.failed(message);
    logger.log({
      level: 'error',
      message: `No user found while attempting to play and or add an existing YouTube link.`,
    });
    return;
  }
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions?.has('CONNECT') || !permissions.has('SPEAK')) {
    reactWithEmoji.failed(message);
    return message.channel.send(
      'Give me permissions for connecting and speaking in the voice channel, then we can party.',
    );
  }

  const {
    volume,
    maxAllowableReached,
    link,
    playlistId,
  } = getYoutubeLinkAndVolFromRequest(message.content, maxAllowableVolume);

  if (link === '#') {
    reactWithEmoji.failed(message);
    return message.channel.send("...I can't play _that_.");
  }

  if (maxAllowableReached) {
    message.channel.send(
      `_shakes his head_ I won't play tracks louder than a level of **${maxAllowableVolume}**.`,
    );
  }

  if (playlistId !== '-') {
    // YouTube playlist
    try {
      const playlistIdIsValid = ytpl.validateID(playlistId);
      if (playlistIdIsValid) {
        const youtubePlaylist = await ytpl(playlistId);
        const numberOfTracks = youtubePlaylist.items.length;
        for (const track of youtubePlaylist.items) {
          await addTrackToPlaylist({
            duration: isFinite(track.durationSec)
              ? (track.durationSec as number)
              : 0,
            message,
            title: track.title,
            trackVolume: volume,
            url: track.shortUrl,
          });
        }
        reactWithEmoji.succeeded(message);
        return message.channel.send(
          `_nods and adds_ **${numberOfTracks}** _tracks with volume at_ **${volume}** _to the list._`,
        );
      }
    } catch (error) {
      logger.log({
        level: 'error',
        message: `Invalid playlist.`,
      });
      reactWithEmoji.failed(message);
      return message.channel.send(
        `_shakes his head_ That YouTube playlist is either private or doesn't exist.`,
      );
    }
  }

  // Single track
  const songInfo = await ytdl.getInfo(link);
  await addTrackToPlaylist({
    duration: (() => {
      const secs = parseInt(songInfo.videoDetails.lengthSeconds, 10);
      return isFinite(secs) ? secs : 0;
    })(),
    message,
    title: songInfo.videoDetails.title,
    trackVolume: volume,
    url: songInfo.videoDetails.video_url,
  });
  reactWithEmoji.succeeded(message);
  return message.channel.send(
    `_nods and adds_ **${songInfo.videoDetails.title}** with volume at **${volume}** _to the list._`,
  );
};
