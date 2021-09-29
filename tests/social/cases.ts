import { BOT_PREFIX } from '../../src/constants';
import {
  howsItGoingPrefixCommands,
  howIsVariants,
  howAreVariants,
  whatIsVariants,
  helpPrefixCommandPatterns,
  helpNaturalMusicRequestExamples,
  helpNaturalRequestPatterns,
  helpNaturalAboutRequestExamples,
} from '../../src/social/constants';
import {
  ExtractedMsgBotRequestDetails,
  MsgBotRequestStyle,
} from '../../src/social/types';
import {
  joinPrefixCommands,
  joinPrefixCommandPatterns,
  loopCyclePrefixCommands,
  loopPlaylistPrefixCommands,
  loopOffPrefixCommands,
  loopTrackPrefixCommands,
  clearPrefixCommands,
  skipPrefixCommands,
  resetPlaylistPrefixCommands,
  disconnectVCPrefixCommands,
  stopSongPrefixCommands,
  joinNaturalRequests,
} from '../../src/music/constants';
import { showPlaylistPrefixCommands } from '../../src/music/list/constants';
import {
  removeTrackPrefixCommandPatterns,
  removeTrackPrefixCommands,
} from '../../src/music/rm/constants';
import { setSongVolPrefixCommands } from '../../src/music/volume/constants';
import { rollDicePrefixPatterns } from '../../src/ttrpg/constants';
import { BOT_NAME } from '../../src/environment';

const botName = BOT_NAME.toLowerCase();

const greetingsBotWillRecognise = [
  '',
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
  // NOTE: Commented out as already checked
  // ',',
  // ', ',
  // '?',
  // '? ',
  // '!',
  // '! ',
  // '...',
  // '... ',
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
  ...removeTrackPrefixCommands,
  ...stopSongPrefixCommands,
  ...disconnectVCPrefixCommands,
  ...resetPlaylistPrefixCommands,
  ...showPlaylistPrefixCommands,
  ...skipPrefixCommands,
  ...clearPrefixCommands,
];

export const expectations = {
  extractRequestDetailsForBot: [
    ...greetingsBotWillRecognise.reduce(
      (acc, greeting) => {
        return separatorsBotWillCheckFor.reduce((acc2, separator) => {
          return naturalRequests.reduce((acc3, naturalRequest) => {
            const greetingAndSep =
              greeting === '' ? '' : `${greeting}${separator}`;
            return [
              ...acc3,
              {
                input: {
                  messageContent: `${greetingAndSep}${botName}${separator}${naturalRequest}`,
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
      },
      [] as {
        input: { messageContent: string };
        output: ExtractedMsgBotRequestDetails;
      }[],
    ),
    ...prefixCommands.reduce(
      (acc, prefixCommand) => {
        return [
          ...acc,
          {
            input: { messageContent: `${BOT_PREFIX}${prefixCommand}` },
            output: {
              greeting: '',
              style: MsgBotRequestStyle.Prefix,
              requestStr: prefixCommand,
            },
          },
        ];
      },
      [] as {
        input: { messageContent: string };
        output: ExtractedMsgBotRequestDetails;
      }[],
    ),
  ],
  identifyRequest: {
    positive: [
      {
        input: { messageContent: '', listOfMatches: [] },
        output: { index: -1, matches: [] },
      },
      // ROLLS
      ...[
        {
          messageContent: 'roll 2d5+10',
          matches: [
            '',
            // Dice format captured
            '2d5+10',
            // rolls
            '2',
            // faces
            '5',
            undefined,
            '+',
            undefined,
            undefined,
            '10',
            '',
          ],
          index: 0,
        },
        {
          messageContent: 'roll 8d10',
          matches: [
            '',
            // Dice format captured
            '8d10',
            // rolls
            '8',
            // faces
            '10',
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            '',
          ],
          index: 0,
        },
        {
          messageContent: '',
          matches: [],
          index: -1,
        },
      ].map(({ messageContent, matches, index }) => {
        return {
          input: {
            messageContent,
            listOfMatches: rollDicePrefixPatterns,
          },
          output: {
            index,
            matches,
          },
        };
      }),
      // MUSIC: JUMP
      ...[
        {
          messageContent: 'k',
          matches: [],
          index: -1,
        },
        {
          messageContent: 'j',
          matches: ['', 'j', ''],
          index: 0,
        },
        {
          messageContent: 'join',
          matches: ['', 'join', ''],
          index: 0,
        },
      ].map(({ messageContent, matches, index }) => {
        return {
          input: {
            messageContent,
            listOfMatches: joinPrefixCommandPatterns,
          },
          output: {
            index,
            matches,
          },
        };
      }),
      // MUSIC: JOIN NATURAL
      ...[
        {
          messageContent: 'join the voice chat',
          matches: ['', ''],
          index: 1,
        },
      ].map(({ messageContent, matches, index }) => {
        return {
          input: {
            messageContent,
            listOfMatches: joinNaturalRequests,
          },
          output: {
            index,
            matches,
          },
        };
      }),
      ...[
        {
          messageContent: 'help',
          matches: ['', undefined, ''],
          index: 0,
        },
      ].map(({ messageContent, matches, index }) => {
        return {
          input: {
            messageContent,
            listOfMatches: helpPrefixCommandPatterns,
          },
          output: {
            index,
            matches,
          },
        };
      }),
      ...[
        ...helpNaturalMusicRequestExamples.map((example) => {
          return {
            messageContent: example,
            matches: ['', undefined, example, ''],
            index: 0,
          };
        }),
        ...helpNaturalAboutRequestExamples.map((example) => {
          return {
            messageContent: example,
            matches: ['', example, undefined, ''],
            index: 0,
          };
        }),
      ].map(({ messageContent, matches, index }) => {
        return {
          input: {
            messageContent,
            listOfMatches: helpNaturalRequestPatterns,
          },
          output: {
            index,
            matches,
          },
        };
      }),
    ] as {
      input: { messageContent: string; listOfMatches: RegExp[] };
      output: { index: number; matches: (string | undefined)[] };
    }[],
    negative: {
      clearShouldNotTriggerRm: {
        input: {
          messageContents: clearPrefixCommands,
          listOfMatches: removeTrackPrefixCommandPatterns,
        },
        output: { index: -1, matches: [] },
      },
    },
  },
};
