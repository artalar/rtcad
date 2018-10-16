const remark = require('remark');
const styleGuide = require('remark-preset-lint-markdown-style-guide');

const stringify = node => remark().stringify(node);

function clearAst(string) {
  return remark()
    .use(styleGuide)
    .parse(
      // remove indents, otherwise parse will invalid
      // FIXME: save indents inside MD
      string.replace(/\n( )*/g, '\n'),
    );
}

function parse(ast) {
  const { children } = clearAst(ast);
  let definition = '';
  let description = '';
  let argsDescription = [];
  let resultDescription = 'void';

  // FIXME: https://github.com/remarkjs/remark/pull/364
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // eslint-disable-next-line
    switch (child.type) {
      case 'heading':
        definition = stringify(child);
        break;
      case 'paragraph':
      case 'blockquote':
        description =
          (description ? `${description}\n` : '') + stringify(child);
        break;
      case 'list': {
        const listItems = child.children;
        // only returns description
        if (listItems.length === 1) {
          resultDescription = stringify(listItems[0]);
          break;
        }

        argsDescription = listItems
          .slice(0, listItems.length - 1)
          .map(listItem => listItem.children.map(stringify).join('\n'));

        resultDescription = listItems[listItems.length - 1].children
          .map(stringify)
          .join('');
        break;
      }
    }
  }

  return { definition, description, argsDescription, resultDescription };
}

module.exports.parse = parse;
