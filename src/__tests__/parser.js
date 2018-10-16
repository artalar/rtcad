const { parse } = require('../parser');

describe('parser', () => {
  describe('parse', () => {
    test('empty', () => {
      const result = parse(``);

      expect(result).toEqual({
        argsDescription: [],
        definition: '',
        description: '',
        resultDescription: 'void',
      });
    });
    test('definition', () => {
      const result = parse(`
        # Function **definition**
      `);

      expect(result).toEqual({
        argsDescription: [],
        definition: '# Function **definition**',
        description: '',
        resultDescription: 'void',
      });
    });
    test('description', () => {
      const result = parse(`
        # Function **definition**
        function description
        > comment
      `);

      expect(result).toEqual({
        definition: '# Function **definition**',
        description: 'function description\n> comment',
        argsDescription: [],
        resultDescription: 'void',
      });
    });
    test('returns', () => {
      const result = parse(`
        # Function **definition**
        - $$secret_key0$$ output!
      `);

      expect(result).toEqual({
        definition: '# Function **definition**',
        description: '',
        argsDescription: [],
        resultDescription: '$$secret_key0$$ output!',
      });
    });
    test('1 argument', () => {
      const result = parse(`
        # Function **definition**
        - $$secret_key1$$ input!
        - $$secret_key0$$ output!
      `);

      expect(result).toEqual({
        definition: '# Function **definition**',
        description: '',
        argsDescription: ['$$secret_key1$$ input!'],
        resultDescription: '$$secret_key0$$ output!',
      });
    });
    test('1 argument description', () => {
      const result = parse(`
        # Function **definition**
        - $$secret_key1$$ input!
          > input description
        - $$secret_key0$$ output!
      `);

      expect(result).toEqual({
        definition: '# Function **definition**',
        description: '',
        argsDescription: ['$$secret_key1$$ input!\n> input description'],
        resultDescription: '$$secret_key0$$ output!',
      });
    });
    test('return void', () => {
      const result = parse(`
        # Function **definition**
        - $$secret_key1$$ input!
        - void
      `);

      expect(result.resultDescription).toBe('void');
    });
    test('2 arguments', () => {
      const result = parse(`
        # Function **definition**
        - $$secret_key1$$ input!
        - $$secret_key2$$ input!
        - $$secret_key0$$ output!
      `);

      expect(result).toEqual({
        definition: '# Function **definition**',
        description: '',
        argsDescription: ['$$secret_key1$$ input!', '$$secret_key2$$ input!'],
        resultDescription: '$$secret_key0$$ output!',
      });
    });
  });
});
