import {
  setSongVolNaturalRequestPatterns,
  setSongVolPrefixCommandPatterns,
} from '../../../src/music/volume/constants';
import {
  ExtractedVolumeDetails,
  TrackVolPrefixCommandMatches,
} from '../../../src/music/volume/types';
import { naturalRequestSharedCases } from './constants';

export const setVolumeCases = {
  identifyRequests: [
    ...naturalRequestSharedCases.map(({ messageContent, matches, index }) => {
      return {
        input: {
          messageContent,
          listOfMatches: setSongVolNaturalRequestPatterns,
        },
        output: {
          index,
          matches,
        },
      };
    }),
    ...[
      {
        messageContent: 'v 4.5',
        matches: ['', '4.5', undefined, ''] as TrackVolPrefixCommandMatches[0],
        index: 0,
      },
      {
        messageContent: 'v vol 4.5',
        matches: ['', '4.5', undefined, ''] as TrackVolPrefixCommandMatches[0],
        index: 0,
      },
      {
        messageContent: 'v 4.5 t 5',
        matches: ['', '4.5', '5', ''] as TrackVolPrefixCommandMatches[0],
        index: 0,
      },
      {
        messageContent: 'v vol 4.5 t 5',
        matches: ['', '4.5', '5', ''] as TrackVolPrefixCommandMatches[0],
        index: 0,
      },
      {
        messageContent: 'v track 4 volume 5',
        matches: ['', '4', '5', ''] as TrackVolPrefixCommandMatches[1],
        index: 1,
      },
      {
        messageContent: 'v t 4 volume 5.65',
        matches: ['', '4', '5.65', ''] as TrackVolPrefixCommandMatches[1],
        index: 1,
      },
    ].map(({ messageContent, matches, index }) => {
      return {
        input: {
          messageContent,
          listOfMatches: setSongVolPrefixCommandPatterns,
        },
        output: {
          index,
          matches,
        },
      };
    }),
  ],
  extractNaturalSetVolumeDetails: [
    {
      input: {
        messageContent: 'crank up the volume to 6',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 6,
        volumeType: 'absolute',
        volActionVerb: 'crank up the volume',
        volAction: 'up',
        volActionType: 'prefix',
      },
    },
    {
      input: {
        messageContent: 'bring the volume up to 3.56',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 3.56,
        volumeType: 'absolute',
        volActionVerb: 'bring the volume up',
        volAction: 'up',
        volActionType: 'sandwich',
      },
    },
    {
      input: {
        messageContent: 'lower da volume to 4.222',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 4.222,
        volumeType: 'absolute',
        volActionVerb: 'lower da volume',
        volAction: 'down',
        volActionType: 'prefix',
      },
    },
    {
      input: {
        messageContent: 'lower the volume down to 5.4',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 5.4,
        volumeType: 'absolute',
        volActionVerb: 'lower the volume down',
        volAction: 'down',
        volActionType: 'sandwich',
      },
    },
    {
      input: {
        messageContent: 'lower the volume down by 5.4',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 5.4,
        volumeType: 'relative',
        volActionVerb: 'lower the volume down',
        volAction: 'down',
        volActionType: 'sandwich',
      },
    },
    {
      input: {
        messageContent: 'make the volume 4.5',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'make the volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
    // Optional words in front
    {
      input: {
        messageContent: 'pretty please are you able to set the volume to 4.5',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'set the volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
    {
      input: {
        messageContent: 'are you able to set to volume 4.5',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'set to volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
    {
      input: {
        messageContent: 'fuckin go ahead and set the volume to 4.5',
      },
      output: {
        playlist: 'default',
        track: 'current',
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'set the volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
    // With track number
    {
      input: {
        messageContent: 'fuckin go ahead and set the volume to 4.5 for track 2',
      },
      output: {
        playlist: 'default',
        track: 2,
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'set the volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
    {
      input: {
        messageContent:
          'fuckin go ahead and set the volume to 4.5 for the 3rd track',
      },
      output: {
        playlist: 'default',
        track: 3,
        volume: 4.5,
        volumeType: 'absolute',
        volActionVerb: 'set the volume',
        volAction: 'neutral',
        volActionType: 'prefix',
      },
    },
  ] as {
    input: { messageContent: string };
    output: ExtractedVolumeDetails;
  }[],
};
