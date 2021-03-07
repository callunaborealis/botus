export type OperatorFormat = '+' | '-' | '*' | 'x' | '/';

export type DieComponentFormatType = 'die' | 'const' | 'operator';

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
