export enum MsgBotRequestStyle {
  // Using the prefix, shortcut
  Prefix = 'prefix',
  // Using English and calling by name
  Natural = 'natural',
  // Non-request
  NotARequest = 'notARequest',
}

export interface ExtractedMsgBotRequestDetails {
  greeting: string;
  style: MsgBotRequestStyle;
  requestStr: string;
}

export type HelpPrefixRequestMatchesShape = [
  beforeText: string,
  helpTypeMatch: 'music' | undefined,
  afterText: string,
];
export type HelpNaturalRequestMatchesShape = [
  beforeText: string,
  aboutRequestStr: string | undefined,
  musicRequestStr: string | undefined,
  afterText: string,
];
