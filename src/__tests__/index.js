const { createRuntype } = require('../');

describe('rtcad', () => {
  describe('basic', () => {
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

  test('custom type', () => {
    const t = createRuntype({ log: false, contract: true });

    let isMapTypeExist = true;
    try {
      t`
        @arg ${Map}
      `(() => {})(new Map());
    } catch (error) {
      expect(error.message).toBe('Types.get(...) is not a function');
      isMapTypeExist = false;
    }
    expect(isMapTypeExist).toBe(false);

    let typeTesterWasCall = false;
    const MapType = t.new(type => {
      typeTesterWasCall = true;
      return type instanceof Map;
    });

    // isn't throw
    t`
        @arg ${MapType}
      `(() => {})(new Map());
    expect(typeTesterWasCall).toBe(true);
  });
});
