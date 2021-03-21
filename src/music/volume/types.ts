export type TrackVolPrefixCommandMatches = [
  [
    beforeText: '',
    volume: string,
    optionalTrackNr: string | undefined,
    afterText: string,
  ],
  [
    beforeText: '',
    optionalTrackNr: string | undefined,
    volume: string,
    afterText: string,
  ],
];

export type TrackVolNaturalRequestMatches = [
  [
    beforeText: string,
    upVolPrefixTerm: string | undefined,
    upVolSandwichTerm: string | undefined,
    downVolPrefixTerm: string | undefined,
    downVolSandwichTerm: string | undefined,
    neutralVolPrefixTerm: string | undefined,
    absoluteVolKeyword: string | undefined,
    relativeVolKeyword: string | undefined,
    volumeLevel: string | undefined,
    trackNrVariant1: string | undefined, // Capture 4 from track 4
    trackNrVariant2: string | undefined, // Capture 4 from 4th track
    afterText: string,
  ],
];

export interface ExtractedVolumeDetails {
  playlist: '-' | string;
  track: 'current' | number;
  volume: number;
  volumeType: 'absolute' | 'relative';
  volActionVerb: string;
  volActionType: 'prefix' | 'sandwich';
  volAction: 'up' | 'down' | 'neutral';
}
