import * as React from 'react'
import * as DeprecatedReactTestUtils from 'react-dom/test-utils'

const reactAct =
  typeof React.act === 'function' ? React.act : DeprecatedReactTestUtils.act

function getGlobalThis() {
  /* istanbul ignore else */
  if (typeof globalThis !== 'undefined') {
    return globalThis
  }
  /* istanbul ignore next */
  if (typeof self !== 'undefined') {
    return self
  }
  /* istanbul ignore next */
  if (typeof window !== 'undefined') {
    return window
  }
  /* istanbul ignore next */
  if (typeof global !== 'undefined') {
    return global
  }
  /* istanbul ignore next */
  throw new Error('unable to locate global object')
}

function setIsReactActEnvironment(isReactActEnvironment) {
  getGlobalThis().IS_REACT_ACT_ENVIRONMENT = isReactActEnvironment
}

function getIsReactActEnvironment() {
  return getGlobalThis().IS_REACT_ACT_ENVIRONMENT
}

async function act(scope) {
  const previousActEnvironment = getIsReactActEnvironment()
  setIsReactActEnvironment(true)
  try {
    // scope passed to domAct needs to be `async` until React.act treats every scope as async.
    // We already enforce `await act()` (regardless of scope) to flush microtasks
    // inside the act scope.
    const result = await reactAct(async () => {
      return scope()
    })
    return result
  } finally {
    setIsReactActEnvironment(previousActEnvironment)
  }
}

export default act
export {
  setIsReactActEnvironment as setReactActEnvironment,
  getIsReactActEnvironment,
}

/* eslint no-console:0 */
