import {
  getConfig as getConfigDTL,
  configure as configureDTL,
} from '@testing-library/dom'

let configForRTL = {
  reactStrictMode: false,
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

  const {reactStrictMode, ...configForDTL} = newConfig

  configureDTL(configForDTL)

  configForRTL = {
    ...configForRTL,
    reactStrictMode,
  }
}

export {getConfig, configure}
