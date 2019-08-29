import React from 'react'
import ReactDOM from 'react-dom'
import * as testUtils from 'react-dom/test-utils'

const reactAct = testUtils.act
const actSupported = reactAct !== undefined

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
let isAsyncActSupported = null

function asyncAct(cb) {
  if (actSupported === true) {
    if (isAsyncActSupported === null) {
      return new Promise((resolve, reject) => {
        // patch console.error here
        const originalConsoleError = console.error
        console.error = function error(...args) {
          /* if console.error fired *with that specific message* */
          /* istanbul ignore next */
          const firstArgIsString = typeof args[0] === 'string'
          if (
            firstArgIsString &&
            args[0].indexOf(
              'Warning: Do not await the result of calling ReactTestUtils.act',
            ) === 0
          ) {
            // v16.8.6
            isAsyncActSupported = false
          } else if (
            firstArgIsString &&
            args[0].indexOf(
              'Warning: The callback passed to ReactTestUtils.act(...) function must not return anything',
            ) === 0
          ) {
            // no-op
          } else {
            originalConsoleError.apply(console, args)
          }
        }
        let cbReturn, result
        try {
          result = reactAct(() => {
            cbReturn = cb()
            return cbReturn
          })
        } catch (err) {
          console.error = originalConsoleError
          reject(err)
          return
        }

        result.then(
          () => {
            console.error = originalConsoleError
            // if it got here, it means async act is supported
            isAsyncActSupported = true
            resolve()
          },
          err => {
            console.error = originalConsoleError
            isAsyncActSupported = true
            reject(err)
          },
        )

        // 16.8.6's act().then() doesn't call a resolve handler, so we need to manually flush here, sigh

        if (isAsyncActSupported === false) {
          console.error = originalConsoleError
          /* istanbul ignore next */
          if (!youHaveBeenWarned) {
            // if act is supported and async act isn't and they're trying to use async
            // act, then they need to upgrade from 16.8 to 16.9.
            // This is a seemless upgrade, so we'll add a warning
            console.error(
              `It looks like you're using a version of react-dom that supports the "act" function, but not an awaitable version of "act" which you will need. Please upgrade to at least react-dom@16.9.0 to remove this warning.`,
            )
            youHaveBeenWarned = true
          }

          cbReturn.then(() => {
            // a faux-version.
            // todo - copy https://github.com/facebook/react/blob/master/packages/shared/enqueueTask.js
            Promise.resolve().then(() => {
              // use sync act to flush effects
              act(() => {})
              resolve()
            })
          }, reject)
        }
      })
    } else if (isAsyncActSupported === false) {
      // use the polyfill directly
      let result
      act(() => {
        result = cb()
      })
      return result.then(() => {
        return Promise.resolve().then(() => {
          // use sync act to flush effects
          act(() => {})
        })
      })
    }
    // all good! regular act
    return act(cb)
  }
  // use the polyfill
  let result
  act(() => {
    result = cb()
  })
  return result.then(() => {
    return Promise.resolve().then(() => {
      // use sync act to flush effects
      act(() => {})
    })
  })
}

export default act
export {asyncAct}

/* eslint no-console:0 */
