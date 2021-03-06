import {
  ExtractedMsgBotRequestDetails,
  MsgBotRequestStyle,
} from '../../src/social/types';

const greetingsBotWillRecognise = [
  // 'h?ello',
  'ello',
  'hello',
  // 'h?allo',
  'allo',
  'hallo',
  // 'h?ey(?: ?h?ey)?',
  'hey',
  'ey',
  'ey ey',
  'hey hey',
  'eyey',
  'heyhey',
  'hi',
  // 'aye?',
  'ay',
  'aye',
  // '(?:wa)?[s]{1,100}?u[p]{1,100}',
  'wasup',
  'wassup',
  'wassssssuppppppppppppp',
  'yo',
  // oy, oi
  'oy',
  'oi',
];

// /(?: |[,?!] ?|[\.]{2,} ?)/gim
const separatorsBotWillCheckFor = [
  ' ',
  ',',
  ', ',
  '?',
  '? ',
  '!',
  '! ',
  '...',
  '... ',
];

interface TestCaseIOShape {
  input: { messageContent: string };
  output: ExtractedMsgBotRequestDetails;
}

export const expectations = {
  extractRequestDetailsForBot: [
    ...greetingsBotWillRecognise.reduce((acc, greeting) => {
      return separatorsBotWillCheckFor.reduce((acc2, separator) => {
        return [
          ...acc2,
          {
            input: {
              messageContent: `${greeting}${separator}botus${separator}raise the volume`,
            },
            output: {
              greeting,
              style: MsgBotRequestStyle.Natural,
              requestStr: 'raise the volume',
            },
          },
        ];
      }, acc);
    }, [] as TestCaseIOShape[]),
    {
      input: { messageContent: ';v' },
      output: {
        greeting: '',
        style: MsgBotRequestStyle.Prefix,
        requestStr: 'v',
      },
    },
  ],
};
