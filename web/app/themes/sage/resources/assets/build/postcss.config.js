/* eslint-disable */

const cssnanoconfig = {
  preset: ['default', { discardcomments: { removeall: true } }]
};

module.exports = ({ file, options }) => {
  return {
    parser: options.enabled.optimize ? 'postcss-safe-parser' : undefined,
    plugins: {
      tailwindcss: `${options.paths.assets}/styles/tailwind.js`,
      cssnano: options.enabled.optimize ? cssnanoconfig : false,
      autoprefixer: true,
    },
  };
};
