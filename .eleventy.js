const yaml = require('js-yaml');

module.exports = (config) => {
  config.addDataExtension('yml', yaml.load);
};
