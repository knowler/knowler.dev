const {renderToStaticMarkup} = require('react-dom/server');
const {createElement} = require('react');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');

require('@babel/register')({
  presets: [
    '@babel/env',
    [
      '@babel/react',
      {
        runtime: 'automatic',
      },
    ],
  ],
});

module.exports = config => {
  config.addPlugin(eleventyNavigationPlugin);

  config.setLibrary(
    'md',
    markdownIt({
      html: true,
    }).use(require('markdown-it-mark')),
  );

  config.addTemplateFormats('jsx');
  config.addExtension('jsx', {
    read: false,
    data: true,
    getData: true,
    getInstanceFromInputPath: inputPath => require(inputPath).default,
    compile: (_permalink, inputPath) => data =>
      renderToStaticMarkup(createElement(require(inputPath).default, data)),
  });

  config.addTransform('add-html-doctype', (content, outputPath) => {
    const doctype = '<!doctype html>';
    return outputPath.endsWith('.html') &&
      !content
        .trim()
        .toLowerCase()
        .startsWith(doctype)
      ? `${doctype}${content}`
      : content;
  });

  return {
    dir: {
      input: 'content',
      layouts: '_layouts',
      includes: '_partials',
      output: 'build',
    },
  };
};
