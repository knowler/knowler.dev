const yaml = require('js-yaml');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = (config) => {
  config.addDataExtension('yml', yaml.load);
  config.addPlugin(syntaxHighlight);
};
