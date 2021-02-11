import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

const volumeBeingSetPattern = new RegExp(
  /(vol(\.|ume))?( as| at| to| with| using)? [\d]+(\.\d+)?/i,
);

/**
 * Ultimate YouTube link detector. See <https://regexr.com/3akf5>
 */
const youtubeLinkPattern = new RegExp(
  /((?:https?:\/\/)?(?:(?:(?:www\.?)?youtube\.com(?:\/(?:(?:watch\?\S*?(v=[^&\s]+)\S*)|(?:v(\/\S*))|(channel\/\S+)|(?:user\/(\S+))|(?:results\?(search_query=\S+))))?)|(?:youtu\.be(\/\S*)?)))/gim,
);

export const getYoutubeLinkAndVolFromRequest = (
  content: string,
  maxAllowableVolume: number,
) => {
  const link = (() => {
    const youtubeLinks = content.match(youtubeLinkPattern);
    if (isArray(youtubeLinks)) {
      return youtubeLinks[0];
    }
    return '#';
  })();

  const { maxAllowableReached, volume } = (() => {
    const volumeMatches = content.match(volumeBeingSetPattern);
    const defaultOutput = {
      volume: maxAllowableVolume / 2,
      maxAllowableReached: false,
    };
    if (isArray(volumeMatches)) {
      const volumeOrder = volumeMatches[0];
      if (isString(volumeOrder)) {
        return volumeOrder.split(' ').reduce((eventualVol, v) => {
          const candidate = parseFloat(v);
          if (isFinite(candidate) && candidate <= maxAllowableVolume) {
            return { volume: candidate, maxAllowableReached: false };
          }
          if (isFinite(candidate) && candidate > maxAllowableVolume) {
            return { volume: maxAllowableVolume, maxAllowableReached: true };
          }
          return {
            volume: eventualVol.volume,
            maxAllowableReached: eventualVol.maxAllowableReached,
          };
        }, defaultOutput);
      }
    }
    return defaultOutput;
  })();

  return {
    link,
    maxAllowableReached,
    volume,
  };
};
