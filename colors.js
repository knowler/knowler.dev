const {generateContrastColors} = require('@adobe/leonardo-contrast-colors');

const base = '#e3fff9';

const green = generateContrastColors({
  colorKeys: ['#00ffca'],
  base,
  ratios: [1.55, 3.1, 4.65, 6.2, 7.75, 9.3, 10.85, 12.4, 13.95],
  colorspace: 'CAM02',
});

module.exports = {
  base,
  green,
};
