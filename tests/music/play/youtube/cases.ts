export const cases = {
  identifyRequest: {
    prefixCommands: {
      positive: [
        {
          input: {
            messageContent: 'play https://www.youtube.com/watch?v=lIzN5LrhQHA',
          },
          output: {
            index: 0,
            link: 'https://www.youtube.com/watch?v=lIzN5LrhQHA',
            volume: 5,
          },
        },
        {
          input: {
            messageContent:
              'play https://www.youtube.com/watch?v=lIzN5LrhQHA at vol 3.4',
          },
          output: {
            index: 0,
            link: 'https://www.youtube.com/watch?v=lIzN5LrhQHA',
            volume: 3.4,
          },
        },
      ],
      negative: [
        {
          input: { messageContent: 'play 2' },
          output: { index: -1, link: '-', volume: 5 },
        },
      ],
    },
  },
};
