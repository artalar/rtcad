module.exports.Types = new Map([
  [undefined, type => type === undefined],
  [null, type => type === null],
  [Boolean, type => typeof type === 'boolean'],
  [Number, type => typeof type === 'number'],
  [String, type => typeof type === 'string'],
  [Array, type => Array.isArray(type)],
  [Object, type => typeof type === 'object' && type !== null],
  [Function, type => typeof type === 'function'],
]);
