export type OperatorFormat = '+' | '-' | '*' | 'x' | '/';

export type DieComponentFormatType = 'die' | 'const' | 'operator';
[
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
];
[
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
];
export type DieRequestStrShape = [
  numberOfRolls: string,
  d: string,
  empty: undefined,
  operator: string | undefined,
  empty: undefined,
  modifier: string | undefined,
];
export type DiceRequestStrMatchesShape = [
  anythingBefore: string,
  diceFormatStr: string,
  ...firstDice: DieRequestStrShape,
  anythingElseAfter: string,
];

interface DieComponentAttributeIndex {
  die: {
    d: number;
    rolls: number;
  };
  const: {
    value: number;
  };
  operator: { value: OperatorFormat };
}

export interface DieComponentFormat<T extends DieComponentFormatType> {
  type: T;
  attributes: DieComponentAttributeIndex[T];
}
