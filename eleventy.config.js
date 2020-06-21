const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const markdownIt = require('markdown-it');
const markdownItClass = require('@toycode/markdown-it-class');

module.exports = config => {
  config.addPlugin(eleventyNavigationPlugin);

  const headingClasses = 'font-oswald font-bold text-green-2 leading-tight';
  config.setLibrary(
    'md',
    markdownIt({html: true}).use(markdownItClass, {
      h1: `${headingClasses} text-s2 sm:text-s4`,
      h2: `${headingClasses} text-s1 sm:text-s3`,
      h3: `${headingClasses} text-s0 sm:text-s2`,
      p: 'text-s-1 sm:text-s0 leading-normal',
      a: 'underline hover:text-green-4 transition-colors duration-200 ease-in',
      ul: 'space-y-2 pl-5 list-disc leading-snug text-s-1 sm:text-s0',
    }),
  );

  return {
    dir: {
      input: 'src',
      layouts: 'layouts',
      includes: 'partials',
      output: 'build',
    },
  };
};
