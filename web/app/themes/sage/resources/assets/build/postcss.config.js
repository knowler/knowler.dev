/* eslint-disable */
const { getPlugins } = require('tachyons-build-css')

module.exports = ({ file, options }) => {
  return {
    parser: options.enabled.optimize ? 'postcss-safe-parser' : undefined,
    plugins: getPlugins({
      minify: options.enabled.optimize ? true : false,
    }),
  };
};
