const { createRuntype } = require('../');

describe('rtcad basic', () => {
  const t = createRuntype({ log: false, contract: true });

  const sqrt = t`
    The function returns the square root of a number
    @arg  ${Number} number
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

describe('rtcad', () => {
  const t = createRuntype({ log: false, contract: true });

  test('custom type', () => {
    let mapIsNotExistedType = false;
    try {
      t`
        @arg ${Map}
      `(() => {})(new Map());
    } catch (error) {
      expect(error.message).toBe('Types.get(...) is not a function');
      mapIsNotExistedType = true;
    }
    expect(mapIsNotExistedType).toBe(true);

    let typeTesterWasCall = false;
    const MapType = t.new(type => {
      typeTesterWasCall = true;
      return type instanceof Map;
    });
    mapIsNotExistedType = false;

    // isn't throw
    t`
        @arg ${MapType}
      `(() => {})(new Map());
    expect(typeTesterWasCall).toBe(true);
  });
});
