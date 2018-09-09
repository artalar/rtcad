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
    let errorMessage = '';

    try {
      sqrt('string');
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toBe('Property #1 "number" is not valid');
  });

  test('validate result', () => {
    let errorMessage = '';
    const MathSqrt = Math.sqrt;
    Math.sqrt = () => 'string';

    try {
      sqrt(25);
    } catch (error) {
      errorMessage = error.message;
    }

    Math.sqrt = MathSqrt;

    expect(errorMessage).toBe('Result "square root" is not valid');
  });
});
