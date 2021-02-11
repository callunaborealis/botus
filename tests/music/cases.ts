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
  ],
};

export const expectedOutputs = {
  getYoutubeLinkAndVolFromRequest: [
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2.222,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2.2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2.222,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2.2,
    },
    {
      link: 'https://www.youtube.com/watch?v=rmL1D_aWTAY&t=688s',
      maxAllowableReached: false,
      volume: 2,
    },
  ],
};
