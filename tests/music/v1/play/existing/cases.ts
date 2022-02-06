export const cases = {
  identifyRequest: {
    prefixCommands: {
      positiveOpt: [
        {
          input: { messageContent: 'p 2' },
          output: { index: 0, track: 2 },
        },
        {
          input: { messageContent: 'p track 5' },
          output: { index: 0, track: 5 },
        },
        {
          input: { messageContent: 'play 8' },
          output: { index: 0, track: 8 },
        },
        {
          input: { messageContent: 'jump 19' },
          output: { index: 0, track: 19 },
        },
        {
          input: { messageContent: 'jump song 9' },
          output: { index: 0, track: 9 },
        },
      ],
      positiveMand: [
        {
          input: { messageContent: 'q track 2' },
          output: { index: 1, track: 2 },
        },
        {
          input: { messageContent: 'queue track 10' },
          output: { index: 1, track: 10 },
        },
        {
          input: { messageContent: 'queue track 7.23' },
          output: { index: 1, track: 7 },
        },
      ],
      negative: [
        {
          input: { messageContent: 'queue 2' },
          output: { index: -1, track: -1 },
        },
        {
          input: {
            messageContent: 'play https://www.youtube.com/watch?v=lIzN5LrhQHA',
          },
          output: { index: -1, track: -1 },
        },
      ],
    },
  },
};
