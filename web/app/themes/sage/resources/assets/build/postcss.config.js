/* eslint-disable */

const cssnanoconfig = {
  preset: ['default', { discardcomments: { removeall: true } }]
};

module.exports = ({ file, options }) => {
  return {
    parser: options.enabled.optimize ? 'postcss-safe-parser' : undefined,
    plugins: {
      tailwindcss: `${options.paths.assets}/styles/tailwind/config.js`,
      'postcss-preset-env': { stage: 0 },
      autoprefixer: true,
      cssnano: options.enabled.optimize ? cssnanoconfig : false,
    },
  };
};
