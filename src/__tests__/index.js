const { createRuntype } = require('../');

describe('runtype', () => {
  const t = createRuntype({});

  const sqrt = t`
    The function returns the square root of a number
    @param  ${Number} number
    @return ${Number} square root
  `(number => {
    const result = Math.sqrt(number);
    return result;
  });

  test('relative function call', () => {
    expect(sqrt(25)).toBe(5);
  });

  test('validate arguments', () => {
    let isError = false;

    try {
      sqrt('string');
    } catch (error) {
      isError = true;
    }

    expect(isError).toBe(true);
  });

  test('validate result', () => {
    let isError = false;
    const MathSqrt = Math.sqrt;
    Math.sqrt = () => 'string';

    try {
      sqrt(25);
    } catch (error) {
      isError = true;
    }

    Math.sqrt = MathSqrt;

    expect(isError).toBe(true);
  });
});
