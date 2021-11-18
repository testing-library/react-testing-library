import {getIsReactActEnvironment, setReactActEnvironment} from './act-compat'
import {cleanup} from './pure'

// if we're running in a test runner that supports afterEach
// or teardown then we'll automatically run cleanup afterEach test
// this ensures that tests run in isolation from each other
// if you don't like this then either import the `pure` module
// or set the RTL_SKIP_AUTO_CLEANUP env variable to 'true'.
if (typeof process === 'undefined' || !process.env?.RTL_SKIP_AUTO_CLEANUP) {
  // ignore teardown() in code coverage because Jest does not support it
  /* istanbul ignore else */
  if (typeof afterEach === 'function') {
    afterEach(() => {
      cleanup()
    })
  } else if (typeof teardown === 'function') {
    // Block is guarded by `typeof` check.
    // eslint does not support `typeof` guards.
    // eslint-disable-next-line no-undef
    teardown(() => {
      cleanup()
    })
  }

  // No test setup with other test runners available
  /* istanbul ignore else */
  if (typeof beforeAll === 'function' && typeof afterAll === 'function') {
    // This matches the behavior of React < 18.
    let previousIsReactActEnvironment = getIsReactActEnvironment()
    beforeAll(() => {
      previousIsReactActEnvironment = getIsReactActEnvironment()
      setReactActEnvironment(true)
    })

    afterAll(() => {
      setReactActEnvironment(previousIsReactActEnvironment)
    })
  }
}

export * from './pure'
