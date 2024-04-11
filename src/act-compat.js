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

function withGlobalActEnvironment(actImplementation) {
  return callback => {
    const previousActEnvironment = getIsReactActEnvironment()
    setIsReactActEnvironment(true)
    try {
      // The return value of `act` is always a thenable.
      let callbackNeedsToBeAwaited = false
      const actResult = actImplementation(() => {
        const result = callback()
        if (
          result !== null &&
          typeof result === 'object' &&
          typeof result.then === 'function'
        ) {
          callbackNeedsToBeAwaited = true
        }
        return result
      })
      if (callbackNeedsToBeAwaited) {
        const thenable = actResult
        return {
          then: (resolve, reject) => {
            thenable.then(
              returnValue => {
                setIsReactActEnvironment(previousActEnvironment)
                resolve(returnValue)
              },
              error => {
                setIsReactActEnvironment(previousActEnvironment)
                reject(error)
              },
            )
          },
        }
      } else {
        setIsReactActEnvironment(previousActEnvironment)
        return actResult
      }
    } catch (error) {
      // Can't be a `finally {}` block since we don't know if we have to immediately restore IS_REACT_ACT_ENVIRONMENT
      // or if we have to await the callback first.
      setIsReactActEnvironment(previousActEnvironment)
      throw error
    }
  }
}

const act = withGlobalActEnvironment(reactAct)

export default act
export {
  setIsReactActEnvironment as setReactActEnvironment,
  getIsReactActEnvironment,
}

/* eslint no-console:0 */
