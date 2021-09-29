import { BOT_NAME } from '../../src/environment';

const botName = BOT_NAME.toLowerCase();

export const expectedInputs = {
  getYoutubeLinkAndVolFromRequest: [
    {
      request: `${botName} play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.222`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.2`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.222`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.2`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2`,
      maxAllowableVolume: 10,
    },
    // Playlist
    {
      request: `${botName} play https://www.youtube.com/playlist?list=PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk`,
      maxAllowableVolume: 10,
    },
    {
      request: `${botName} play https://www.youtube.com/playlist?list=PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk at vol 2`,
      maxAllowableVolume: 10,
    },
  ],
};

export const expectedOutputs = {
  getYoutubeLinkAndVolFromRequest: [
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2.222,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2.2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2.222,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2.2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      playlistId: '-',
      volume: 2,
    },
    // Playlist
    {
      link: 'https://www.youtube.com',
      maxAllowableReached: false,
      playlistId: 'PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk',
      volume: 5,
    },
    {
      link: 'https://www.youtube.com',
      maxAllowableReached: false,
      playlistId: 'PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk',
      volume: 2,
    },
  ],
};

export const expectations = {
  identifyRequest: {
    rm: [
      {
        input: 'rm 22',
        output: {
          index: 0,
          matches: ['', '22', ''],
          trackNr: 22,
        },
      },
      {
        input: 'rm',
        output: {
          index: 0,
          matches: ['', undefined, ''],
          trackNr: 'current',
        },
      },
      {
        input: 'rm song',
        output: {
          index: 0,
          matches: ['', undefined, 'song'],
          trackNr: 'current',
        },
      },
      {
        input: 'rm track 12',
        output: {
          index: 0,
          matches: ['', '12', ''],
          trackNr: 12,
        },
      },
      {
        input: 'rm song 24',
        output: {
          index: 0,
          matches: ['', '24', ''],
          trackNr: 24,
        },
      },
    ],
  },
};
