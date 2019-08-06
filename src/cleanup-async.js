// This file is for use by the top-level export
// @testing-library/react/cleanup-after-each
// It is not meant to be used directly

module.exports = async function cleanupAsync() {
  const {asyncAct} = require('./act-compat')
  const {cleanup} = require('./index')
  await asyncAct(async () => {})
  cleanup()
}
