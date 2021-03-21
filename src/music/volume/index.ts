import isString from 'lodash/isString';

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
