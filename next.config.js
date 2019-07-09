module.exports = {
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/server': 'preact/compat',
    }

    return config
  },
  exportPathMap: defaultPathMap => ({
    ...defaultPathMap,
    '/': { page: '/' },
  })
}
