const {typescale} = require('@knowler/typescale');

const colors = require('./colors');

module.exports = {
  purge: {
    mode: 'all',
    content: ['./build/**/*.html'],
  },
  theme: {
    colors,
    fontFamily: {
      body: ['"Inter"', 'system-ui', 'sans-serif'],
      oswald: ['"Oswald"', 'system-ui', 'sans-serif'],
    },
    fontSize: typescale({
      ratio: 1.25,
      top: 8,
      bottom: -2,
      base: 1.25,
      unit: 'rem',
      precision: 3,
      prefix: 's',
    }),
    extend: {
      maxWidth: {
        '48ch': '48ch',
      },
    },
  },
  variants: {},
  plugins: [],
};
