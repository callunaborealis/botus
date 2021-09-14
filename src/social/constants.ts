import {
  naturalRequestTerminatorPatternStr,
  prefixCommandTerminatorPatternStr,
} from '../constants';
import {
  BOT_FLAVOUR_MENTOR,
  BOT_NAME,
  BOT_FLAVOUR_ORIGIN,
  BOT_PREFIX,
  BOT_FLAVOUR_DOWNTIME_ACTION_1,
  BOT_FLAVOUR_OLD_MOTIVATION,
  BOT_FLAVOUR_USER_FRIENDLY_N_NICKNAME_1,
  BOT_FLAVOUR_OLD_MEANING_OF_LIFE,
  BOT_FLAVOUR_DOWNTIME_ACTION_2,
  BOT_FLAVOUR_OLD_MOTIVATION_2,
} from '../environment';

/**
 * @deprecated
 */
export const hailRequests = [
  // name + greeting
  // /^BOT_NAME[\s]?[,?!(\.\.\.)]?(h?ello|[h]?ey([h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy])?( |$)/gim
  new RegExp(
    `^${BOT_NAME}[s]?[,?!(...)]?(h?ello|[h]?ey([h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy])?( |$)`,
    'gim',
  ),
  // greeting + name
  // /^(([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]) )?BOT_NAME[\s]?[,?!(\.\.\.)]?/gim,
  new RegExp(
    `(([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]) )?${BOT_NAME}[\\s]?[,?!(\\.\\.\\.)]?`,
    'gim',
  ),
  // /^;hail$/gim,
  new RegExp(`^${BOT_PREFIX}hail$`, 'gim'),
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
  // /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?BOT_NAME( |$)/gim
  new RegExp(
    `^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?${BOT_NAME}( |$)`,
    'gim',
  ),
  // name + greeting
  // /^BOT_NAME (([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]))?( |$)/gim
  new RegExp(
    `${BOT_NAME} (([h]?ello|[h]?ey( [h]?ey)?|hi|ay|(wa[s]{0,100})?su[p]{1,100}|yo|o[iy]))?( |$)`,
    'gim',
  ),
  // time of day
  // /^BOT_NAME (good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]?( |$)/gim
  new RegExp(
    `${BOT_NAME} (good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]?( |$)`,
    'gim',
  ),
  // /^(good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]? BOT_NAME( |$)/gim
  new RegExp(
    `(good )?(mornin[g]?|day|afternoon|evenin[g]?|night|nite)[,.!]? ${BOT_NAME}( |$)`,
    'gim',
  ),
  // whats up
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?what[']?s[\s]?up( |$)/gim,
  // /^what[']?s[\s]?up BOT_NAME/gim,
  new RegExp(`^what[']?s[\\s]?up ${BOT_NAME}`, 'gim'),
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wa[s]{1,100}up( |$)/gim,
  // /^wa[s]{1,100}up BOT_NAME/gim,
  new RegExp(`^wa[s]{1,100}up ${BOT_NAME}`, 'gim'),
  /^(([h]?ello |[h]?ey ([h]?ey)? |hi |ay |(wa[s]{0,100})?su[p]{1,100} |yo |o[iy] ))?wh[au]t[\s]?up( |$)/gim,
  // /^wh[au]t[\s]?up BOT_NAME( |$)/gim,
  new RegExp(`^wh[au]t[\\s]?up ${BOT_NAME}`, 'gim'),
  // /^BOT_NAME[,.!?]? wassup( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? wassup( |$)`, 'gim'),
  // /^[was]?sup BOT_NAME( |$)/gim,
  new RegExp(`^[was]?sup${BOT_NAME}( |$)`, 'gim'),
  // Debug
  // /^;hi$/i,
  new RegExp(`${BOT_PREFIX}hi$`, 'i'),
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
  // /^BOT_NAME[,.!?]? how(( i)|')?s it goin[g]?( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? how(( i)|')?s it goin[g]?( |$)`, 'gim'),
  // /^BOT_NAME[,.!?]? how are things?( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? how are things?( |$)`, 'gim'),
  // /^BOT_NAME[,.!?]? how(( i)|')?s things?( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? how(( i)|')?s things?( |$)`, 'gim'),
  // /^BOT_NAME[,.!?]? what('| i)?s up( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? what('| i)?s up( |$)`, 'gim'),
  // Debug
  // /^;howru$/i,
  new RegExp(`^${BOT_PREFIX}$`, 'i'),
];

/**
 * Asking if BOT_NAME is okay
 * @deprecated
 */
export const howAreYouRequests = [
  /**
   * BOT_NAME how are ya
   * BOT_NAME! how are ya
   * BOT_NAME? how are ya
   * BOT_NAME, how are ya
   * BOT_NAME how are you
   */
  // /^BOT_NAME[,.!?]? how (are|r) (ya|(you|ya|u))( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? how (are|r) (ya|(you|ya|u))( |$)`, 'gim'),
  // /how are (ya|(you|ya|u))[,?!]? BOT_NAME[!?]?( |$)/gim,
  new RegExp(`how are (ya|(you|ya|u))[,?!]? ${BOT_NAME}[!?]?( |$)`, 'gim'),
  // /^(are (you|ya|u) )?doin['g]? (alright|alrite|okay|fine)[,?!]? BOT_NAME[!?]?( |$)/gim,
  new RegExp(
    `^(are (you|ya|u) )?doin['g]? (alright|alrite|okay|fine)[,?!]? ${BOT_NAME}[!?]?( |$)`,
    'gim',
  ),
  // /^((you|ya|u) )?(alright|alrite|okay|fine)[,?!]? BOT_NAME[!?]?( |$)/gim,
  new RegExp(
    `^((you|ya|u) )?(alright|alrite|okay|fine)[,?!]? ${BOT_NAME}[!?]?( |$)`,
    'gim',
  ),
  // /^BOT_NAME[,.!?]? (are (you|ya|u) )?doin['g]? (alright|alrite|oka?y?|fine)[?!]?( |$)/gim,
  new RegExp(
    `^${BOT_NAME} (are (you|ya|u) )?doin['g]? (alright|alrite|oka?y?|fine)[?!]?( |$)`,
    'gim',
  ),
  // /^BOT_NAME[,.!?]? (are (you|ya|u) )?(doin['g]? )?(alright|alrite|oka?y?|fine)[?!]?( |$)/gim,
  new RegExp(
    `^${BOT_NAME} (are (you|ya|u) )?(doin['g]? )?(alright|alrite|oka?y?|fine)[?!]?( |$)`,
    'gim',
  ),
  // /^BOT_NAME[,.!?]? how're (you|ya|u)[?!]?( |$)/gim,
  new RegExp(`^${BOT_NAME}[,.!?]? how're (you|ya|u)[?!]?( |$)`, 'gim'),
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
    `I'm alright, ${username}. Just miss ${BOT_FLAVOUR_ORIGIN} a little.`,
  (username: string) => `I'm as good as I ever can be, ${username}.`,
  () => '_gives a thumbs up._',
  () => "I'm doing okay. Barely.",
  () => `I miss ${BOT_FLAVOUR_ORIGIN}, to be honest.`,
  () => "I have my hair on my head. So I'm just peachy.",
  () => "_shrugs._ I'll be fine. Take care friendo.",
];

/**
 * @deprecated
 */
export const gratitudeRequests = [
  // /^[\w\d\s]{0,10}BOT_NAME(,|\.+|!)? thank (you|ya|u)( |$)/gim,
  new RegExp(
    `[\\w\\d\\s]{0,10}${BOT_NAME}(,|\\.+|!)? thank (you|ya|u)( |$)`,
    'gim',
  ),
  // /^[\w\d\s]{0,10}BOT_NAME(,|\.+|!)? thanks( |$)/gim,
  new RegExp(`[\\w\\d\\s]{0,10}${BOT_NAME}(,|\\.+|!)? thanks( |$)`, 'gim'),
  // /^[\w\d\s]{0,10}thank (you|ya|u)(,|\.+|!)? BOT_NAME( |$)/gim,
  new RegExp(
    `^[\\w\\d\\s]{0,10}thank (you|ya|u)(,|\\.+|!)? ${BOT_NAME}( |$)`,
    'gim',
  ),
  // /^[\w\d\s]{0,10}thanks(,|\.+|!)? BOT_NAME( |$)/gim,
  new RegExp(`^[\\w\\d\\s]{0,10}thanks(,|\\.+|!)? ${BOT_NAME}( |$)`, 'gim'),
  // /^[\w\d\s]{0,10}thank (you|ya|u) for[\w\d\s]{0,20}?,? BOT_NAME( |$)/i,
  new RegExp(
    `^[\\w\\d\\s]{0,10}thank (you|ya|u) for[\\w\\d\\s]{0,20}?,? ${BOT_NAME}( |$)`,
    'gim',
  ),
  // /^[\w\d\s]{0,10}thanks for[\w\d\s]{0,20}?(,|\.+)? BOT_NAME( |$)/i,
  new RegExp(
    `^[\\w\\d\\s]{0,10}thanks for[\\w\\d\\s]{0,20}?(,|\\.+)? ${BOT_NAME}( |$)`,
    'gim',
  ),
  // Debug
  // /^;thanks$/i,
  new RegExp(`^${BOT_PREFIX}thanks$`, 'i'),
];

/**
 * @deprecated
 */
export const hugRequests = [
  // /^BOT_NAME[,\.!?]? (I want|give me|I need|I would like|can (you|ya|u)|can you give me|can I have) (a )?hugs?( |$)/gim,
  new RegExp(
    `^${BOT_NAME}[,\\.!?]? (I want|give me|I need|I would like|can (you|ya|u)|can you give me|can I have) (a )?hugs?( |$)`,
    'gim',
  ),
  // /^BOT_NAME[,\.!?]? (I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy)( |$)/gim,
  new RegExp(
    `^${BOT_NAME}[,\\.!?]? (I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy)( |$)`,
    'gim',
  ),
  // /^(I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy) BOT_NAME[,.!]?( |$)/gim,
  new RegExp(
    `^(I'?m|I am) (glum|hopeless|miserable|sad|depressed|down|unhappy) ${BOT_NAME}[,.!]?( |$)`,
    'gim',
  ),
  // /BOT_NAME[,\.!?]? I wanna hug( (you|ya|u))?( |$)/gim,
  new RegExp(`${BOT_NAME}[,\\.!?]? I wanna hug( (you|ya|u))?( |$)`, 'gim'),
  // /BOT_NAME[,\.!?]? can I hug( (you|ya|u))?( |$)/gim,
  new RegExp(`${BOT_NAME}[,\\.!?]? can I hug( (you|ya|u))?( |$)`, 'gim'),
  // /BOT_NAME[,\.!?]? can (you|ya|u) hug( (you|ya|u))?( |$)/gim,
  new RegExp(
    `${BOT_NAME}[,\\.!?]? can (you|ya|u) hug( (you|ya|u))?( |$)`,
    'gim',
  ),
  // /BOT_NAME[,\.!?]? can I (get|have)( a)? hug[,.!]?( |$)/gim,
  new RegExp(
    `${BOT_NAME}[,\\.!?]? can I (get|have)( a)? hug[,.!]?( |$)`,
    'gim',
  ),
  // /can I hug (you|ya|u)[,\.]? BOT_NAME( |$)/gim,
  new RegExp(`can I hug (you|ya|u)[,\\.]? ${BOT_NAME}( |$)`, 'gim'),
  // /(I want|give me) (a )?hugs?[,\.!?]? BOT_NAME( |$)/gim,
  new RegExp(`(I want|give me) (a )?hugs?[,\.!?]? ${BOT_NAME}( |$)`, 'gim'),
  // /^BOT_NAME[,\.!?]? hug$/gim,
  new RegExp(`^${BOT_NAME}[,\.!?]? hug$`, 'gim'),
  // Debug
  // /^;hug$/gim,
  new RegExp(`^${BOT_NAME}$`, 'gim'),
];
export const hugResponses = [
  (username: string) =>
    `_${BOT_FLAVOUR_DOWNTIME_ACTION_2}. He then walks to ${username} and pats them on the back._ You'll live to fight another day.`,
  (username: string) => `_sighs and gives ${username} a reluctant half-hug._`,
  (username: string) =>
    `_sighs and sits down next to ${username}._ Here's something ${BOT_FLAVOUR_MENTOR} taught me: When you lose, do not lose the lesson.`,
  () =>
    `An ex-lover of mine once told me that the shortest distance between friends is their hugs.`,
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
  // /^BOT_NAME[,\.!?]? tell (me|us|them) the meaning? of life(\?|$)/gim,
  new RegExp(
    `^${BOT_NAME}[,\\.!?]? tell (me|us|them) the meaning? of life( |\\?|$)`,
    'gim',
  ),
  // /^BOT_NAME[,\.!?]? what('| i)?s the meaning? of life(\?|$)/gim,
  new RegExp(
    `^${BOT_NAME}[,\\.!?]? what('| i)?s the meaning? of life( |\\?|$)`,
    'gim',
  ),
  // /( |^)what('| i)?s the meaning? of life[,\.!?]? BOT_NAME( |$)/gim,
  new RegExp(
    `( |^)what('| i)?s the meaning? of life[,\\.!?]? ${BOT_NAME}( |\\?|$)`,
    'gim',
  ),
  // /( |^)what do (you|ya|u) think is the meaning? of life[,\.!?]? BOT_NAME( |$)/gim,
  new RegExp(
    `( |^)what do (you|ya|u) think is the meaning? of life[,\\.!?]? ${BOT_NAME}( |\\?|$)`,
    'gim',
  ),
  // /( |^)tell (me|us|them) the meaning? of life[,\.!?]? BOT_NAME( |$)/gim,
  new RegExp(
    `( |^)tell (me|us|them) the meaning? of life[,\\.!?]? ${BOT_NAME}( |\\?|$)`,
    'gim',
  ),
  // /(?: |^)do you know what(?:'| i)?s the meaning? of life[,.!?]? BOT_NAME[,.!? ]?(?: |$)/gim,
  new RegExp(
    `(?: |^)do you know what(?:'| i)?s the meaning? of life[,.!?]? ${BOT_NAME}[,.!? ]?( |\\?|$)`,
    'gim',
  ),
];
export const meaningOfLifeResponses = [
  () => `...42.`,
  () =>
    `To me? ${BOT_FLAVOUR_OLD_MEANING_OF_LIFE}... _He closes his eyes sadly._ But that was a long time ago.`,
  () => `For me, ${BOT_FLAVOUR_OLD_MOTIVATION_2}.`,
  () =>
    `Whatever you want it to be, ${BOT_FLAVOUR_USER_FRIENDLY_N_NICKNAME_1}.`,
  () =>
    `I dunno. _He shrugs._ I thought ${BOT_FLAVOUR_OLD_MOTIVATION}, but now it's just bein' a third rate shitty music Discord chat bot application.`,
  () =>
    `Meanin' of life huh? _He ${BOT_FLAVOUR_DOWNTIME_ACTION_1}, shrugging._ Whatever you tell yourself that gets you out of bed in the mornin', I guess.`,
];

// BOT_NAME is mentioned but doesn't know how to respond. BOT_NAME will behave awkwardly.
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
