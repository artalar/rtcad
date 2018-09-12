const { Types } = require('./types');

// TODO: improve
const secretTag = Math.random().toString();

const parseDescription = (descriptions, types) => {
  const [functionDescription, ...typeDescriptions] = descriptions
    .join(secretTag)
    // TODO: escape `@` in user description
    .split('@')
    .map(str => str.trim());

  let argumentDescriptions;
  let returnDescription;
  let argumentTypes;
  let returnType;

  if (/@return/.test(descriptions) === true) {
    argumentDescriptions = typeDescriptions.slice(0, typeDescriptions.length - 1);
    returnDescription = typeDescriptions[typeDescriptions.length - 1];
    argumentTypes = types.slice(0, types.length - 1);
    returnType = types[types.length - 1];
  } else {
    argumentDescriptions = typeDescriptions.slice();
    returnDescription = `return ${secretTag} void`;
    argumentTypes = types.slice();
    returnType = undefined;
  }

  const argumentNames = argumentDescriptions.map(argumentDescriptionRaw => {
    const argumentDescription = argumentDescriptionRaw
      .slice(argumentDescriptionRaw.indexOf(secretTag) + secretTag.length)
      .trim();
    return argumentDescription ? ` "${argumentDescription}"` : '';
  });

  let resultName = returnDescription
    .slice(returnDescription.indexOf(secretTag) + secretTag.length)
    .trim();
  resultName = resultName ? ` "${resultName}"` : '';

  return {
    functionDescription,
    argumentDescriptions,
    returnDescription,
    argumentTypes,
    returnType,
    argumentNames,
    resultName,
  };
};

const checkType = (relative, target) => Types.get(target)(relative);

const createRuntype = (options = {}) => {
  const { log = false, contract = false } = options;
  const runtype = (descriptions, ...types) => {
    const {
      functionDescription,
      argumentTypes,
      returnType,
      argumentNames,
      resultName,
    } = parseDescription(descriptions, types);

    return f => (...params) => {
      if (log === true) {
        console.groupCollapsed(`rtcad: ${functionDescription}`);
      }

      for (let i = 0; i < argumentTypes.length; i++) {
        if (checkType(params[i], argumentTypes[i]) !== true) {
          const error = new Error(`Property #${i + 1}${argumentNames[i]} is not valid`);

          if (log === true) {
            console.error(error);
            console.groupEnd();
          }

          if (contract === true) throw error;
        }
      }

      const result = f(...params);

      if (checkType(result, returnType) !== true) {
        const error = new Error(`Result${resultName} is not valid`);

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
          new Error(`Invalid tester callback: expect a function, but got "${testerType}"`),
        );
      // eslint-disable-next-line no-param-reassign
      tester = () => {
        if (log === true) console.warn(new Error(`Invalid type was call: "${testerType}"`));
        return false;
      };
    }
    const typeId = Symbol(description);
    Types.set(typeId, tester);
    return typeId;
  };

  return runtype;
};

module.exports.createRuntype = createRuntype;
