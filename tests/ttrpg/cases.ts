export const expectations = {
  getDiceFormat: [
    {
      input: { diceFormat: '' },
      ouput: { diceFormat: '0d1+0' },
    },
    {
      input: { diceFormat: '1d4' },
      ouput: { diceFormat: '1d4+0' },
    },
    {
      input: { diceFormat: '3d4' },
      ouput: { diceFormat: '3d4+0' },
    },
    {
      input: { diceFormat: '1d4+4' },
      ouput: { diceFormat: '1d4+4' },
    },
    {
      input: { diceFormat: '3d4+4' },
      ouput: { diceFormat: '3d4+4' },
    },
  ],
};
