import {
  howsItGoingPrefixCommands,
  howIsVariants,
  howAreVariants,
  whatIsVariants,
} from '../../src/social/constants';
import {
  ExtractedMsgBotRequestDetails,
  MsgBotRequestStyle,
} from '../../src/social/types';
import {
  joinPrefixCommands,
  loopCyclePrefixCommands,
  loopPlaylistPrefixCommands,
  loopOffPrefixCommands,
  loopTrackPrefixCommands,
  setSongVolPrefixCommands,
  removeSongPrefixCommands,
  clearPrefixCommands,
  skipPrefixCommands,
  listPrefixCommands,
  resetPlaylistPrefixCommands,
  disconnectVCPrefixCommands,
  stopSongPrefixCommands,
} from '../../src/music/constants';

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

const howsItGoingPhrases = [
  // how(( i)|')?s it goin[g\\']?
  'how is it going',
  "how's it going",
  'hows it going',
  'how it going',
  'how is it goin',
  "how's it goin",
  'hows it goin',
  'how it goin',
  // how(( i)|')?s things?
  ...howIsVariants.map((v) => `${v} things`),
  // how (?:r|are) things?
  ...howAreVariants.map((v) => `${v} thing`),
  // what('| i)?s up
  ...whatIsVariants.map((v) => `${v} up`),
];

interface TestCaseIOShape {
  input: { messageContent: string };
  output: ExtractedMsgBotRequestDetails;
}

const naturalRequests = ['raise the volume'];
const prefixCommands = [
  ...howsItGoingPrefixCommands,
  // Music
  ...joinPrefixCommands,
  ...loopPlaylistPrefixCommands,
  ...loopOffPrefixCommands,
  ...loopCyclePrefixCommands,
  ...loopTrackPrefixCommands,
  ...setSongVolPrefixCommands,
  ...removeSongPrefixCommands,
  ...stopSongPrefixCommands,
  ...disconnectVCPrefixCommands,
  ...resetPlaylistPrefixCommands,
  ...listPrefixCommands,
  ...skipPrefixCommands,
  ...clearPrefixCommands,
];

export const expectations = {
  extractRequestDetailsForBot: [
    ...greetingsBotWillRecognise.reduce((acc, greeting) => {
      return separatorsBotWillCheckFor.reduce((acc2, separator) => {
        return naturalRequests.reduce((acc3, naturalRequest) => {
          return [
            ...acc3,
            {
              input: {
                messageContent: `${greeting}${separator}botus${separator}${naturalRequest}`,
              },
              output: {
                greeting,
                style: MsgBotRequestStyle.Natural,
                requestStr: naturalRequest,
              },
            },
          ];
        }, acc2);
      }, acc);
    }, [] as TestCaseIOShape[]),
    ...prefixCommands.reduce((acc, prefixCommand) => {
      return [
        ...acc,
        {
          input: { messageContent: `;${prefixCommand}` },
          output: {
            greeting: '',
            style: MsgBotRequestStyle.Prefix,
            requestStr: prefixCommand,
          },
        },
      ];
    }, [] as TestCaseIOShape[]),
  ],
};
