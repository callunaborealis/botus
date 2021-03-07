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
