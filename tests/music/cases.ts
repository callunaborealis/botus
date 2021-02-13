export const expectedInputs = {
  getYoutubeLinkAndVolFromRequest: [
    {
      request:
        'botus play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.222',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.2',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus play https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.222',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2.2',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus add https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s at vol 2',
      maxAllowableVolume: 10,
    },
    // Playlist
    {
      request:
        'botus play https://www.youtube.com/playlist?list=PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk',
      maxAllowableVolume: 10,
    },
    {
      request:
        'botus play https://www.youtube.com/playlist?list=PLxmJrG61oPEYHGMdmzqNE3P7O1UUdCezk at vol 2',
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
