export const hailRequests = [
  // greeting + name
  /^([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy]) botus/gim,
  // name + greeting
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?([h]?ello|[h]?ey|hi|ay|(was)?sup|yo|o[iy])/gim,
  // name first
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus[ ]?[,?!(...)]/gim,
  /^;hail$/gim,
];

export const hailResponses = [
  () => 'Hey.',
  () => '_barely nods._',
  (username: string) => `gives a reluctant wave to ${username}.`,
  (username: string) => `Hi, ${username}.`,
];

export const helphelpRequests = [/^(;help[ ]?help)|(botus help[ ]?help)/gim];
export const helpRequests = [/^(;h)|(;help)|(botus help)/gim];

export const greetingRequests = [
  // greeting + name
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus$/gim,
  // name + greeting
  /^botus (([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]))?$/gim,
  // time of day
  /^botus (good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]?$/gim,
  /^(good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]? botus$/gim,
  // whats up
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?what[']?s[ ]?up$/gim,
  /^what[']?s[ ]?up botus/gim,
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wa[s]{1,100}up$/gim,
  /^wa[s]{1,100}up botus/gim,
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wh[au]t[ ]?up$/gim,
  /^wh[au]t[ ]?up botus$/gim,
  // Debug
  /;hi/i,
];
export const greetingResponses = [
  () => '_barely nods._',
  () => 'Mm-hm.',
  (username: string) => `Yep, hello to you too, ${username}.`,
  () => '_gives a lazy salute._',
  (username: string) => `_nods_ Nice to see you too, ${username}.`,
  (username: string) => `Hello to you too, ${username}.`,
  () => `:wave:`,
];

export const howsItGoingRequests = [
  /**
   * botus how are ya
   * botus! how are ya
   * botus? how are ya
   * botus, how are ya
   * botus how are you
   */
  /^botus[,.!?]? how are (ya|you)/gim,
  /how are (ya|you)[,?!]? botus[!?]?$/gim,
  /^botus[,.!?]? how[']?s it goin[g]?/gim,
  /^botus[,.!?]? how is it goin[g]?/gim,
  /^botus[,.!?]? wassup/gim,
  /^[was]?sup botus/gim,
  // Debug
  /;howru/i,
];

export const howsItGoingResponses = [
  () => "_shrugs._ It's alright, I guess.",
  (username: string) => `It's going ok, ${username}.`,
  () => 'Could be better I suppose. But alright.',
  () => '_gives a thumbs up._',
  () => 'Another day, another dollar, I suppose.',
];

export const gratitudeRequests = [
  /^[\w\d\s]{0,10}botus[,.!]? thank you/gim,
  /^[\w\d\s]{0,10}botus[,.!]? thanks/gim,
  /^[\w\d\s]{0,10}thank you[,.!]? botus/gim,
  /^[\w\d\s]{0,10}thanks[[^,!?-]|[\w\d\s]]{0,20}? botus/gim,
  /^[\w\d\s]{0,10}thanks for[[^,!?-]|[\w\d\s]]{0,20},? botus/i,
  // Debug
  /;thanks/i,
];

export const hugRequests = [
  /^botus[,.!?]? (I want|give me) (a )?hugs?/gim,
  /^botus[,.!?]? (I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy)/gim,
  /^(I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy) botus[,.!]?/gim,
  /botus ((I want|(can you )?give me|can I have) )(a )?hugs?(,|\.)?/gim,
  /botus I wanna hug you/gim,
  /botus can I hug you/gim,
  /can I hug you botus/gim,
  /(I want|give me) (a )?hugs?(,| )? botus/gim,
  /^botus hug$/gim,
  // Debug
  /^;hug$/gim,
];
export const hugResponses = [
  (username: string) =>
    `_lights a cigarette and puffs it. He then walks to ${username} and pats them on the back._ You'll live to fight another day.`,
  (username: string) => `_sighs and gives ${username} a reluctant half-hug._`,
  (username: string) =>
    `_sighs and sits down next to ${username}._ Here's something my old squad leader told me: When you lose, do not lose the lesson.`,
  () =>
    `My ex-girlfriend once told me that the shortest distance between friends is their hugs.`,
  () =>
    `_pats you on the back, giving you a half-smile._ It's gonna be alright in the end.`,
  (username: string) =>
    `_unscrews the cap of his metal flask and hands it to ${username}._ You need a drink?`,
];

export const gratitudeResponses = [
  (username: string) =>
    `_looks at ${username} and gives a low-effort two-finger wave._`,
  () => 'My pleasure.',
  () => 'Mm-hm.',
  (username: string) => `No problem, ${username}.`,
  () => '_gives a small bow._',
  () => '_gives a thumbs up._',
  () => `_gives a brief wink and turns away._`,
];

// Bot is mentioned but doesn't know how to respond. Botus will behave awkwardly.
export const defaultResponses = [
  () => '_shrugs._',
  () => ':confused: What...?',
  () => '_flips his hair and looks away, unconcerned._',
  (username: string) => `_stares at ${username} blankly._`,
  (username: string) => `_gives a half-hearted wave to ${username}._`,
  (username: string) =>
    `_nods at ${username} silently, but it's pretty clear he wasn't listening._`,
  (username: string) =>
    `_turns to look at ${username} and then goes back to sleep._`,
  (username: string) => `_looks at ${username} and raises an eyebrow._`,
  () => `_squints and just shakes his head._`,
  () => 'Uhhh... no idea what ya want there.',
  () => 'Uhhh... okay?',
  () => 'Right...',
  () => 'Sure... sure...',
  () => '_just looks at you with a glare._',
  (username: string) =>
    `_lights a cigarette, ignoring what ${username} had said._`,
  (username: string) =>
    `_gives a polite laugh then immediately walks away, completely forgetting what ${username} has said._`,
  (username: string) =>
    `_stretches his arms for a short second. He exhales, then stares at ${username} for a short second before walking away._`,
];
