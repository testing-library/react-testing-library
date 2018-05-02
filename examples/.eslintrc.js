module.exports = {
  // we have to do this so our tests can reference 'react-testing-library'
  overrides: [
    {
      files: ['**/__tests__/**'],
      settings: {
        'import/resolver': {
          jest: {
            jestConfigFile: require.resolve('./jest.config.js'),
          },
        },
      },
    },
  ],
}
