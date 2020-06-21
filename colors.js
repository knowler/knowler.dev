const {generateContrastColors} = require('@adobe/leonardo-contrast-colors');

const base = '#e3fff9';

const green = generateContrastColors({
  colorKeys: ['#00ffca'],
  base,
  ratios: [1.5, 3, 4.5, 6, 7.5, 9, 10.5, 12, 13.5],
  colorspace: 'CAM02',
});

module.exports = {
  base,
  green,
};
