const commonjs = require('rollup-plugin-commonjs')
const rollupConfig = require('kcd-scripts/dist/config/rollup.config')

// the exports in this library should always be named for all formats.
rollupConfig.output[0].exports = 'named'
rollupConfig.external = ['react-dom']

// override the cjs plugin
const cjsPluginIndex = rollupConfig.plugins.findIndex(
  plugin => plugin.name === 'commonjs',
)
rollupConfig.plugins[cjsPluginIndex] = commonjs({
  include: 'node_modules/**',
  namedExports: {
    'react-dom/cjs/react-dom-test-utils.development': ['Simulate'],
  },
})

module.exports = rollupConfig
