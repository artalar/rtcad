/*
  ### TODO:
    #### type
      - `test()`
      - "generator" (for auto generation tests)
    #### types
      + undefined
      + null
      + Boolean
      + Number
        + default
        - int, float, double
          - positive, negative (unsigned)...
            > https://en.wikipedia.org/wiki/C_data_types
      + String
        + default
        - Char
      + Array
      + Object
      + Function
      - Literal
      - Symbol
      - None (null | undefined)
      - Falsy (https://developer.mozilla.org/en-US/docs/Glossary/Falsy)
      - Truthy (https://developer.mozilla.org/en-US/docs/Glossary/Truthy)
      - Instance
      - Union (array?)
      - Map
      - Set
      - Class
      - Model 
        - shape (default?)
        - exact
        > array of types - is a model?
      - Tuple
      - Collection
    #### Mods
      - maybe
      - `toString()` (for key of collections)
      - `assign()` (merge types)
      - `diff()` (difference from 2 (or more) types)
*/

module.exports.Types = new Map([
  [undefined, type => type === undefined],
  ['void', type => type === undefined],
  [null, type => type === null],
  [Boolean, type => typeof type === 'boolean'],
  [Number, type => typeof type === 'number'],
  [String, type => typeof type === 'string'],
  [Array, type => Array.isArray(type)],
  [Object, type => typeof type === 'object' && type !== null],
  [Function, type => typeof type === 'function'],
]);
