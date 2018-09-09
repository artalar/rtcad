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

const checkType = (relative, target) => Object(relative) instanceof target;

const createRuntype = (options = { log: false }) => (descriptions, ...types) => {
  const { log } = options;
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

        throw error;
      }
    }

    const result = f(...params);

    if (checkType(result, returnType) !== true) {
      const error = new Error(`Result${resultName} is not valid`);

      if (log === true) {
        console.error(error);
        console.groupEnd();
      }

      throw error;
    }

    if (log === true) {
      console.groupEnd();
    }

    return result;
  };
};

module.exports.createRuntype = createRuntype;
