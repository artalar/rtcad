const { Types } = require('./types');
const { parse: parseDocumentation } = require('./parser');

function butifyFieldDescription(description) {
  if (description === '') return description;
  return ` "${description}"`;
}

function parse(documentation, types) {
  let argsType = [];
  let resultType;

  const {
    definition,
    description,
    argsDescription,
    resultDescription,
  } = parseDocumentation(documentation.join(''));

  if (resultDescription === 'void') {
    types = types.concat(undefined);
  }

  argsType = types.slice(0, types.length - 1);
  resultType = types[types.length - 1];

  return {
    definition,
    description,
    argsDescription: argsDescription.map(butifyFieldDescription),
    resultDescription: butifyFieldDescription(resultDescription),
    argsType,
    resultType,
  };
}

function checkType(relative, target) {
  return Types.get(target)(relative);
}

function createRuntype(options = {}) {
  const { log = false, contract = false } = options;
  const runtype = (descriptions, ...types) => {
    const parsedParams = parse(descriptions, types);
    const {
      definition,
      description: functionDescription,
      argsType,
      resultType,
      argsDescription,
      resultDescription,
    } = parsedParams;

    return f => (...params) => {
      if (log === true) {
        console.groupCollapsed(`rtcad: ${definition}`);
      }

      for (let i = 0; i < argsType.length; i++) {
        if (checkType(params[i], argsType[i]) !== true) {
          const error = new Error(
            `Property #${i + 1}${argsDescription[i]} is not valid`,
          );

          if (log === true) {
            console.error(error);
            console.groupEnd();
          }

          if (contract === true) throw error;
        }
      }

      const result = f(...params);

      if (checkType(result, resultType) !== true) {
        const error = new Error(`Result${resultDescription} is not valid`);

        if (log === true) {
          console.error(error);
          console.groupEnd();
        }

        if (contract === true) throw error;
      }

      if (log === true) {
        console.groupEnd();
      }

      return result;
    };
  };

  // add context
  runtype.new = (tester, description = '@@rtcad/type') => {
    const testerType = typeof tester;
    if (testerType !== 'function') {
      if (log === true)
        console.error(
          new Error(
            `Invalid tester callback: expect a function, but got "${testerType}"`,
          ),
        );
      // eslint-disable-next-line no-param-reassign
      tester = () => {
        if (log === true)
          console.warn(new Error(`Invalid type was call: "${testerType}"`));
        return false;
      };
    }
    const typeId = Symbol(description);
    Types.set(typeId, tester);
    return typeId;
  };

  return runtype;
}

module.exports.createRuntype = createRuntype;
