// TODO: improve
const secretTag = Math.random().toString();

const createRuntype = options => (text, ...io) => {
  const [output, ...input] = io.reverse();
  input.reverse();

  const [description, ...ioDescription] = text
    .join(secretTag)
    .trim()
    .split('\n');

  const [outputDescription, ...inputDescription] = ioDescription.reverse();
  inputDescription.reverse();

  const paramNames = inputDescription.map(paramName => {
    paramName = paramName.slice(paramName.indexOf(secretTag) + secretTag.length).trim();
    return paramName ? ` "${paramName}"` : '';
  });

  let resultName = outputDescription
    .slice(outputDescription.indexOf(secretTag) + secretTag.length)
    .trim();
  resultName = resultName ? ` "${resultName}"` : '';

  return f => (...params) => {
    for (let i = 0; i < input.length; i++) {
      if (!(Object(params[i]) instanceof input[i])) {
        throw new Error(`Property #${i + 1}${paramNames[i]} is not valid`);
      }
    }

    const result = f(...params);

    if (!(Object(result) instanceof output)) {
      throw new Error(`Result${resultName} is not valid`);
    }

    return result;
  };
};

module.exports.createRuntype = createRuntype;
