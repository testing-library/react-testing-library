import React from 'react'
import ReactDOM from 'react-dom'

let reactAct
try {
  reactAct = require('react-dom/test-utils').act
} catch (error) {
  // ignore, this is to support old versions of react
}

// act is supported react-dom@16.8.0
// so for versions that don't have act from test utils
// we do this little polyfill. No warnings, but it's
// better than nothing.
function actPolyfill(cb) {
  ReactDOM.unstable_batchedUpdates(cb)
  ReactDOM.render(<div />, document.createElement('div'))
}

const act = reactAct || actPolyfill

function rtlAct(...args) {
  return act(...args)
}

export default rtlAct
