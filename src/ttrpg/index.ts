import { Message, MessageEmbed } from 'discord.js';
import { nodeCrypto, Random } from 'random-js';
import isFinite from 'lodash/isFinite';
import { reactWithEmoji } from '../social';

import {
  dieComponentParts,
  optionalOperatorParts,
  operatorComponentParts,
} from './constants';
import { DieComponentFormat, OperatorFormat } from './types';
import { THEME_COLOUR } from '../constants';

const random = new Random(nodeCrypto);

const rollDie = (minDieValue: number, maxDieValue: number): number => {
  const dieValue = random.integer(minDieValue, maxDieValue);
  return dieValue;
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
  const spliced = [...values];
  if (spliced.length === 0) {
    return 0;
  }
  if (spliced.length === 1) {
    return values[0];
  }
  spliced.splice(0, 1);
  return spliced.reduce((ev, value) => {
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
  }, values[0]);
};

export const calculateDiceResult = (
  requestStr: string,
): { isInvalid: boolean; total: number; values: string[] } => {
  const diceComponents: DieComponentFormat<
    'die' | 'const' | 'operator'
  >[] = interpretDiceRollRequest(requestStr);
  if (diceComponents.length === 0) {
    return {
      isInvalid: true,
      total: NaN,
      values: [],
    };
  }
  const { displayedValues, total } = diceComponents.reduce(
    (eventualValues, diceComponent) => {
      switch (diceComponent.type) {
        case 'const': {
          const modifier = (diceComponent as DieComponentFormat<'const'>)
            .attributes.value;
          return {
            ...eventualValues,
            total: operateOnValues(eventualValues.previousOperator, [
              eventualValues.total,
              modifier,
            ]),
            displayedValues: [
              ...eventualValues.displayedValues,
              `(**${modifier}**)`,
            ],
            previousValue: modifier,
            values: [...eventualValues.values, modifier],
          };
        }
        case 'die': {
          const {
            rolls,
            d,
          } = (diceComponent as DieComponentFormat<'die'>).attributes;
          const dice = rollMultipleDice(`${rolls}d${d}`);
          return {
            ...eventualValues,
            total: operateOnValues(eventualValues.previousOperator, [
              eventualValues.total,
              dice.total,
            ]),
            displayedValues: [
              ...eventualValues.displayedValues,
              `( ${dice.values.map((val) => `**[ ${val} ]**`).join(' + ')} : ${
                dice.total
              } )`,
            ],
            previousValue: dice.total,
            values: [...eventualValues.values, dice.total],
          };
        }
        default: {
          const operator = (diceComponent as DieComponentFormat<'operator'>)
            .attributes.value;
          return {
            ...eventualValues,
            displayedValues: [
              ...eventualValues.displayedValues,
              ` ${operator} `,
            ],
            previousOperator: operator,
          };
        }
      }
    },
    {
      total: 0,
      displayedValues: [] as string[],
      previousValue: 0,
      previousOperator: '+' as OperatorFormat,
      values: [] as number[],
    },
  );
  return { isInvalid: false, total, values: displayedValues };
};

export const respondWithDiceResult = (message: Message, requestStr: string) => {
  const { isInvalid, total, values } = calculateDiceResult(requestStr);

  if (isInvalid) {
    return reactWithEmoji.failed(message);
  }

  const embed = new MessageEmbed()
    .setColor(THEME_COLOUR)
    .setAuthor(
      message.member?.nickname ?? message.author.username,
      message.author.avatarURL() ?? undefined,
    )
    .setTitle(`Rolling ${requestStr}`)
    .addFields(
      { name: 'Total', value: total },
      { name: 'Values', value: values.join('') },
    );
  return message.channel.send(embed);
};
