module.exports = function rtlUMDPlugin() {
  if (!process.env.BUILD_FORMAT || !process.env.BUILD_FORMAT.includes('umd')) {
    return {name: 'dtl-umd', visitor: {}}
  }

  // this is here for the UMD build. It replaces our react-dom/test-utils
  // with the actual file we want resolved to so rollup doesn't complain
  // and the test utils can be included into the bundle.
  return {
    name: 'rtl-umd-build',
    visitor: {
      ImportDeclaration(path) {
        const source = path.get('source')
        if (source.node.value === 'react-dom/test-utils') {
          source.set('value', 'react-dom/cjs/react-dom-test-utils.development')
        }
      },
      ExportAllDeclaration(path) {
        const source = path.get('source')
        if (source.node.value === 'react-dom/test-utils') {
          source.set('value', 'react-dom/cjs/react-dom-test-utils.development')
        }
      },
    },
  }
}
