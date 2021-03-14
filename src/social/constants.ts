import {
  naturalRequestTerminatorPatternStr,
  prefixCommandTerminatorPatternStr,
} from '../constants';

/**
 * @deprecated
 */
export const hailRequests = [
  // name + greeting
  /^botus[\s]?[,?!(\.\.\.)]?(h?ello|[h]?ey([h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy])?( |$)/gim,
  // greeting + name
  /^(([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]) )?botus[\s]?[,?!(\.\.\.)]?/gim,
  /^;hail$/gim,
];

/**
 * /(?: |[,?!] ?|[\.]{2,} ?)/gim
 */
export const botNameContentSeparator = '(?: |[,?!] ?|[\\.]{2,} ?)';

export const listOfGreetingsToBot = [
  // ello, hello
  'h?ello',
  // allo, hallo
  'h?allo',
  // hey, ey, ey ey, hey hey, eyey, heyhey
  'h?ey(?: ?h?ey)?',
  'hi',
  // ay, aye
  'aye?',
  // wassssssuppppppppppppp or wassup or wasup or sup
  '(?:wa)?[s]{1,100}?u[p]{1,100}',
  'yo',
  // oy, oi
  'o[iy]',
];

export const hailResponses = [
  () => 'Hey.',
  () => '_barely nods._',
  (username: string) => `gives a reluctant wave to ${username}.`,
  (username: string) => `Hi, ${username}.`,
];

/**
 * @deprecated
 */
export const helphelpRequests = [/^(;help[\s]?help)|(botus help[\s]?help)/gim];
export const helpHelpPrefixCommands = ['help help', 'helphelp'];
export const helpHelpPrefixCommandPatterns = [
  new RegExp(
    `(?:${helpHelpPrefixCommands.join(
      '|',
    )})${prefixCommandTerminatorPatternStr}`,
  ),
];
export const helpPrefixCommands = ['h', 'help'];
export const helpMusicTypes = ['music'];
export const helpPrefixCommandPatterns = [
  new RegExp(
    `(?:${helpPrefixCommands.join('|')})(?: (${helpMusicTypes.join(
      '|',
    )}))?${prefixCommandTerminatorPatternStr}`,
  ),
];
export const helpNaturalAboutRequestExamples = [
  // Issues
  'where can i report an issue about you',
  'how to fix you',
  'can i suggest how to make you better',
  // Identity
  'who are you',
  'what are you',
  'who made you',
];
export const helpNaturalMusicRequestExamples = [
  'help me with music',
  'how to play music',
  'how do you play music',
  'how to play youtube videos',
  'how do you use music',
  'how to get you to play youtube',
  'i want to see music readme',
  'show me how to play music',
  'how to get you to stop playing music',
  'how to reduce volume',
  'how to raise volume',
  'show me how to use you for music',
];
export const helpNaturalRequestPatterns = [
  new RegExp(
    `(?:(${helpNaturalAboutRequestExamples
      .map((eg) => `(?:${eg})`)
      .join('|')})|(${helpNaturalMusicRequestExamples
      .map((eg) => `(?:${eg})`)
      .join('|')}))${naturalRequestTerminatorPatternStr}`,
    'gim',
  ),
];

/**
 * @deprecated
 */
export const greetingRequests = [
  // greeting + name
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?botus( |$)/gim,
  // name + greeting
  /^botus (([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]))?( |$)/gim,
  // time of day
  /^botus (good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]?( |$)/gim,
  /^(good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]? botus( |$)/gim,
  // whats up
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?what[']?s[\s]?up( |$)/gim,
  /^what[']?s[\s]?up botus/gim,
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wa[s]{1,100}up( |$)/gim,
  /^wa[s]{1,100}up botus/gim,
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wh[au]t[\s]?up( |$)/gim,
  /^wh[au]t[\s]?up botus( |$)/gim,
  /^botus[,.!?]? wassup( |$)/gim,
  /^[was]?sup botus( |$)/gim,
  // Debug
  /^;hi$/i,
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

// Asking if the context is okay
export const howsItGoingPrefixCommands = ['howru'];
export const howIsVariants = ['how is', "how's", 'hows'];
export const howAreVariants = ["how're", 'how r', 'how are'];
export const whatIsVariants = ['what is', "what's", 'whats'];
export const howsItGoingNaturalRequests = [
  // How is it going
  "how(?:(?: i)|')?s it goin[g']?",
  // How is/are things
  `(?:${[...howIsVariants, ...howAreVariants].join('|')}) things?`,
  `(?:${whatIsVariants.join('|')}) up`,
];
/**
 * @deprecated
 */
export const howIsItGoingRequests = [
  /^botus[,.!?]? how(( i)|')?s it goin[g]?( |$)/gim,
  /^botus[,.!?]? how are things?( |$)/gim,
  /^botus[,.!?]? how(( i)|')?s things?( |$)/gim,
  /^botus[,.!?]? what('| i)?s up( |$)/gim,
  // Debug
  /^;howru$/i,
];

/**
 * Asking if Botus is okay
 * @deprecated
 */
export const howAreYouRequests = [
  /**
   * botus how are ya
   * botus! how are ya
   * botus? how are ya
   * botus, how are ya
   * botus how are you
   */
  /^botus[,.!?]? how (are|r) (ya|(you|ya|u))( |$)/gim,
  /how are (ya|(you|ya|u))[,?!]? botus[!?]?( |$)/gim,
  /^(are (you|ya|u) )?doin['g]? (alright|alrite|okay|fine)[,?!]? botus[!?]?( |$)/gim,
  /^((you|ya|u) )?(alright|alrite|okay|fine)[,?!]? botus[!?]?( |$)/gim,
  /^botus[,.!?]? (are (you|ya|u) )?doin['g]? (alright|alrite|oka?y?|fine)[?!]?( |$)/gim,
  /^botus[,.!?]? (are (you|ya|u) )?(doin['g]? )?(alright|alrite|oka?y?|fine)[?!]?( |$)/gim,
  /^botus[,.!?]? how're (you|ya|u)[?!]?( |$)/gim,
];

export const howsItGoingResponses = [
  () => "_shrugs._ It's alright, I guess.",
  () => "I'm doing okay, thanks for asking.",
  (username: string) => `It's going ok, ${username}.`,
  () =>
    `I was just thinking of that time that crazy captain sat me down and cut my hair... _He shivers._`,
  (username: string) =>
    `_smiles slightly._ Hope you are doing good too, ${username}.`,
  () =>
    `I was just thinking of that time that crazy shady lookin' tincan took my hair and wore it as a wig... _He shivers._`,
  () => `Things are okay. Could be better, could be worse.`,
  () => 'Another day, another dollar, I suppose.',
];

export const howAreYouResponses = [
  (username: string) =>
    `I'm alright, ${username}. Just miss Aricarus a little.`,
  (username: string) => `I'm as good as I ever can be, ${username}.`,
  () => '_gives a thumbs up._',
  () => "I'm doing okay. Barely.",
  () => 'I miss Aricarus, to be honest.',
  () => "I have my hair on my head. So I'm just peachy.",
  () => "_shrugs._ I'll be fine. Take care friendo.",
];

/**
 * @deprecated
 */
export const gratitudeRequests = [
  /^[\w\d\s]{0,10}botus(,|\.+|!)? thank (you|ya|u)( |$)/gim,
  /^[\w\d\s]{0,10}botus(,|\.+|!)? thanks( |$)/gim,
  /^[\w\d\s]{0,10}thank (you|ya|u)(,|\.+|!)? botus( |$)/gim,
  /^[\w\d\s]{0,10}thanks(,|\.+|!)? botus( |$)/gim,
  /^[\w\d\s]{0,10}thank (you|ya|u) for[\w\d\s]{0,20}?,? botus( |$)/i,
  /^[\w\d\s]{0,10}thanks for[\w\d\s]{0,20}?(,|\.+)? botus( |$)/i,
  // Debug
  /^;thanks$/i,
];

/**
 * @deprecated
 */
export const hugRequests = [
  /^botus[,\.!?]? (I want|give me|I need|I would like|can (you|ya|u)|can you give me|can I have) (a )?hugs?( |$)/gim,
  /^botus[,\.!?]? (I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy)( |$)/gim,
  /^(I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy) botus[,.!]?( |$)/gim,
  /botus[,\.!?]? I wanna hug( (you|ya|u))?( |$)/gim,
  /botus[,\.!?]? can I hug( (you|ya|u))?( |$)/gim,
  /botus[,\.!?]? can (you|ya|u) hug( (you|ya|u))?( |$)/gim,
  /botus[,\.!?]? can I (get|have)( a)? hug[,.!]?( |$)/gim,
  /can I hug (you|ya|u)[,\.]? botus( |$)/gim,
  /(I want|give me) (a )?hugs?[,\.!?]? botus( |$)/gim,
  /^botus[,\.!?]? hug$/gim,
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
  () => `Yep. You're welcome.`,
];
/**
 * @deprecated
 */
export const meaningOfLifeRequests = [
  /^botus[,\.!?]? tell (me|us|them) the meaning? of life(\?|$)/gim,
  /^botus[,\.!?]? what('| i)?s the meaning? of life(\?|$)/gim,
  /( |^)what('| i)?s the meaning? of life[,\.!?]? botus( |$)/gim,
  /( |^)what do (you|ya|u) think is the meaning? of life[,\.!?]? botus( |$)/gim,
  /( |^)tell (me|us|them) the meaning? of life[,\.!?]? botus( |$)/gim,
  /( |^)do you know what('| i)?s the meaning? of life[,\.!?]? botus( |$)/gim,
];
export const meaningOfLifeResponses = [
  () => `...42.`,
  () =>
    `To me? It was fighting for what for the rights of my home... _He closes his eyes sadly._ But that was a long time ago.`,
  () =>
    `For me, it was about doing the right thing. Fighting for freedom and so on.`,
  () => `Whatever you want it to be, buckaroo.`,
  () =>
    `I dunno. _He shrugs._ I thought I was supposed to lead Ariarcus to freedom from UA control, but now it's just bein' a third rate shitty music Discord chat bot application.`,
  () =>
    `Meanin' of life huh? _He lights a cigarette and exhales, shrugging._ Whatever you tell yourself that gets you out of bed in the mornin', I guess.`,
];

// Bot is mentioned but doesn't know how to respond. Botus will behave awkwardly.
export const defaultResponses = [
  () => '_shrugs._',
  () => '_flips his hair and looks away, unconcerned._',
  () => "_squints._ I dunno, probably I'll let you know another day.",
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
  () => '_just looks confused._',
  () => "_massages his head._ I can't do that...",
  () => 'Right...',
  () => 'Sure... sure...',
  () => 'Hmph. Maybe.',
  () => "I dunno. I can't help you there.",
  () => '_widens his eyes and silently turns away._',
  () => '_just looks at you with a glare._',
  (username: string) =>
    `_lights a cigarette, ignoring what ${username} had said._`,
  (username: string) =>
    `_gives a polite laugh then immediately walks away, completely forgetting what ${username} has said._`,
  (username: string) =>
    `_stretches his arms for a short second. He exhales, then stares at ${username} for a short second before walking away._`,
];
