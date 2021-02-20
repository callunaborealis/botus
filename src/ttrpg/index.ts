import { Message, MessageEmbed } from 'discord.js';

const rollDie = (minDieValue: number, maxDieValue: number): number => {
  const dieVal =
    minDieValue + Math.floor(Math.random() * (maxDieValue - minDieValue + 1));
  return dieVal;
};

/**
 * @param {string} diceFormat, e.g. {numberOfDice}d${maxDieValue}+{constantValue}
 */
const rollMultipleDice = (
  diceFormat: string,
): { total: number; values: (string | number)[] } => {
  const dice = diceFormat.split('+');
  const diceVar = dice[0].split('d');
  const diceConst = dice[1] === '' ? 0 : parseInt(dice[1], 10);
  const [numberOfDice, maxDieValue] = diceVar.map((v) => parseInt(v, 10));
  const values = [...new Array(numberOfDice)].map(() =>
    rollDie(1, maxDieValue),
  );
  const additional = diceConst > 0 ? [`+${diceConst}`] : [];
  const result = {
    total: [...values].reduce((prevVal, currValue) => {
      return prevVal + currValue;
    }, diceConst),
    values: [...values, ...additional],
  };
  return result;
};

export const getDiceFormat = (candidate: string): string => {
  const a = candidate.split('+')[0].split('d');
  const b = candidate.split('+');
  // 2 => 0d0+2
  if (
    a.length === 1 &&
    b.length === 1 &&
    parseInt(a[0], 10) > 0 &&
    parseInt(b[1], 10) > 0
  ) {
    return `0d1+${candidate}`;
  }
  // 1+3 => 0d0+4
  if (a.length === 1) {
    return `0d1+${b.reduce((prev, curr) => {
      if (parseInt(curr, 10) > 0) {
        return prev + parseInt(curr, 10);
      }
      return prev;
    }, 0)}`;
  }
  // 2d4 => 2d4+0
  if (b.length === 1 && parseInt(a[0], 10) > 0 && parseInt(a[1], 10) > 0) {
    return `${a[0]}d${a[1]}+0`;
  }
  // 2d5+2 => 2d5+2
  if (
    parseInt(a[0], 10) > 0 &&
    parseInt(a[1], 10) > 0 &&
    parseInt(b[1], 10) > 0
  ) {
    return `${a[0]}d${a[1]}+${b[1]}`;
  }
  // '' => 0d0+0
  return '0d1+0';
};

export const respondWithDiceResult = (message: Message) => {
  if (!message?.content) {
    return message.channel.send('Nothing');
  }
  const matches = message.content.match(/\d+ ?d ?\d+( ?\+\d+)?/gim);
  if (!matches) {
    return message.channel.send('Nothing');
  }
  const rollFormat = getDiceFormat(matches[0]);
  const dices = rollMultipleDice(rollFormat);
  const values = dices.values.map((v) => {
    if (v.toString().split('+').length > 1) {
      return `${v}`;
    }
    return `[  ${v} ]`;
  });
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`Rolling ${rollFormat}`)
    .addFields(
      { name: 'Total', value: dices.total },
      { name: 'Values', value: values.join(' ') },
    );
  return message.channel.send(embed);
};
