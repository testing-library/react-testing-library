import {
  getConfig as getConfigDTL,
  configure as configureDTL,
} from '@testing-library/dom'

function jestFakeTimersAreEnabled() {
  /* istanbul ignore else */
  if (typeof jest !== 'undefined' && jest !== null) {
    return (
      // legacy timers
      setTimeout._isMockFunction === true || // modern timers
      // eslint-disable-next-line prefer-object-has-own -- No Object.hasOwn in all target environments we support.
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock')
    )
  } // istanbul ignore next

  return false
}

function maybeAdvanceJestTimers(delay) {
  if (jestFakeTimersAreEnabled()) {
    jest.advanceTimersByTime(delay)
  }
}

let configForRTL = {
  reactStrictMode: false,
  advanceTimers: maybeAdvanceJestTimers,
}

function getConfig() {
  return {
    ...getConfigDTL(),
    ...configForRTL,
  }
}

function configure(newConfig) {
  if (typeof newConfig === 'function') {
    // Pass the existing config out to the provided function
    // and accept a delta in return
    newConfig = newConfig(getConfig())
  }

  const {reactStrictMode, advanceTimers, ...configForDTL} = newConfig

  configureDTL(configForDTL)

  configForRTL = {
    ...configForRTL,
    reactStrictMode,
    advanceTimers,
  }
}

export {getConfig, configure}
