module.exports = config => {
  config.addPassthroughCopy('src/**/*.css');

  return {
    dir: {
      input: 'src',
      layouts: 'layouts',
      includes: 'partials',
      output: 'build',
    },
  };
};
