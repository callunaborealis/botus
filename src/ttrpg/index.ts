import { Message, MessageEmbed } from 'discord.js';
import isFinite from 'lodash/isFinite';
import { reactWithEmoji } from '../social';

import {
  dieComponentParts,
  optionalOperatorParts,
  operatorComponentParts,
} from './constants';
import { DieComponentFormat, OperatorFormat } from './types';

const rollDie = (minDieValue: number, maxDieValue: number): number => {
  const dieVal =
    minDieValue + Math.floor(Math.random() * (maxDieValue - minDieValue + 1));
  return dieVal;
};

/**
 * @param {string} diceFormat, e.g. {numberOfDice}d${maxDieValue}
 */
const rollMultipleDice = (
  diceFormat: string,
): { total: number; values: number[] } => {
  const [rolls, d] = diceFormat.split('d').map((v) => parseInt(v, 10));
  const values = [...new Array(rolls)].map(() => rollDie(1, d));
  const result = {
    total: values.reduce((prevVal, currValue) => {
      return prevVal + currValue;
    }, 0),
    values,
  };
  return result;
};

export const interpretDiceRollRequest = (
  messageContent: string,
): DieComponentFormat<'die' | 'const' | 'operator'>[] => {
  const operatorPattern = new RegExp(operatorComponentParts.join(''), 'gim');
  const dieComponentPattern = new RegExp(dieComponentParts.join(''), 'gim');
  const diceComponents = messageContent.split(operatorPattern);
  const eventual: DieComponentFormat<'die' | 'const' | 'operator'>[] = [];
  let invalidDice = false;
  for (let i = 0; i < diceComponents.length; i++) {
    const diceComponent = diceComponents[i];
    // 1d5 -> [ '', '1', '5', undefined, '' ]
    // 12 -> [ '', undefined, undefined, 12, '' ]
    // + -> ['+']
    const parts = diceComponent.split(dieComponentPattern);
    if (
      parts.length === 1 &&
      optionalOperatorParts.includes(parts[0] as OperatorFormat)
    ) {
      eventual.push({
        type: 'operator',
        attributes: {
          value: parts[0] as OperatorFormat,
        },
      });
    }
    if (parts.length !== 5 && parts.length !== 1) {
      invalidDice = true;
      break;
    }
    const candidates = {
      d: parseInt(parts[1]),
      rolls: parseInt(parts[2]),
      const: parseInt(parts[3]),
    };
    if (isFinite(candidates.d) && isFinite(candidates.rolls)) {
      eventual.push({
        type: 'die',
        attributes: {
          d: parseInt(parts[2]),
          rolls: parseInt(parts[1]),
        },
      });
    } else if (isFinite(candidates.const)) {
      eventual.push({
        type: 'const',
        attributes: {
          value: parseInt(parts[3]),
        },
      });
    }
  }

  return invalidDice ? [] : eventual;
};

const operateOnValues = (operator: OperatorFormat, values: number[]) => {
  return values.reduce((ev, value) => {
    if (operator === '+') {
      return ev + value;
    }
    if (operator === '-') {
      return ev - value;
    }
    if (operator === 'x' || operator === '*') {
      return ev * value;
    }
    if (operator === '/') {
      return Math.floor(ev / value);
    }
    return ev;
  }, 0);
};

export const respondWithDiceResult = (message: Message, requestStr: string) => {
  const diceComponents: DieComponentFormat<
    'die' | 'const' | 'operator'
  >[] = interpretDiceRollRequest(requestStr);

  if (diceComponents.length === 0) {
    return reactWithEmoji.failed(message);
  }

  let currentOperator: OperatorFormat = '+';
  let totalValue = 0;
  const values = diceComponents.map((diceComponent) => {
    switch (diceComponent.type) {
      case 'const': {
        const modifier = (diceComponent as DieComponentFormat<'const'>)
          .attributes.value;
        totalValue = operateOnValues(currentOperator, [totalValue, modifier]);
        return `(**${modifier}**)`;
      }
      case 'die': {
        const {
          rolls,
          d,
        } = (diceComponent as DieComponentFormat<'die'>).attributes;
        const dice = rollMultipleDice(`${rolls}d${d}`);
        totalValue = operateOnValues(currentOperator, [totalValue, dice.total]);
        return `( ${dice.values.map((val) => `**[ ${val} ]**`).join(' + ')} : ${
          dice.total
        } )`;
      }
      default: {
        const operator = (diceComponent as DieComponentFormat<'operator'>)
          .attributes.value;
        currentOperator = operator;
        return ` ${operator} `;
      }
    }
  });
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`Rolling ${requestStr}`)
    .addFields(
      { name: 'Total', value: totalValue },
      { name: 'Values', value: values.join('') },
    );
  return message.channel.send(embed);
};
