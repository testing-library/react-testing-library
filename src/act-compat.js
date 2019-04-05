import React from 'react'
import ReactDOM from 'react-dom'
import {reactDomSixteenPointNineIsReleased} from './react-dom-16.9.0-is-released'

let reactAct
let actSupported = false
let asyncActSupported = false
try {
  reactAct = require('react-dom/test-utils').act
  actSupported = reactAct !== undefined

  const originalError = console.error
  let errorCalled = false
  console.error = () => {
    errorCalled = true
  }
  console.error.calls = []
  /* istanbul ignore next */
  reactAct(() => ({then: () => {}})).then(() => {})
  /* istanbul ignore next */
  if (!errorCalled) {
    asyncActSupported = true
  }
  console.error = originalError
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

let youHaveBeenWarned = false
// this will not avoid warnings that react-dom 16.8.0 logs for triggering
// state updates asynchronously, but at least we can tell people they need
// to upgrade to avoid the warnings.
async function asyncActPolyfill(cb) {
  // istanbul-ignore-next
  if (
    !youHaveBeenWarned &&
    actSupported &&
    reactDomSixteenPointNineIsReleased
  ) {
    // if act is supported and async act isn't and they're trying to use async
    // act, then they need to upgrade from 16.8 to 16.9.
    // This is a seemless upgrade, so we'll add a warning
    console.error(
      `It looks like you're using a version of react-dom that supports the "act" function, but not an awaitable version of "act" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.`,
    )
    youHaveBeenWarned = true
  }
  const result = await cb()
  // make all effects resolve after
  act(() => {})
  return result
}

// istanbul ignore next
const asyncAct = asyncActSupported ? reactAct : asyncActPolyfill

export default act
export {asyncAct}

/* eslint no-console:0 */
