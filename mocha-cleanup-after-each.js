require('./dont-cleanup-after-each')
const rtl = require('./')

exports.mochaHooks = {
  afterEach() {
    rtl.cleanup()
  },
}
