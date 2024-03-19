import {configure, getConfig} from '../'

describe('configuration API', () => {
  let originalConfig
  beforeEach(() => {
    // Grab the existing configuration so we can restore
    // it at the end of the test
    configure(existingConfig => {
      originalConfig = existingConfig
      // Don't change the existing config
      return {}
    })
  })

  afterEach(() => {
    configure(originalConfig)
  })

  describe('DTL options', () => {
    test('configure can set by a plain JS object', () => {
      const testIdAttribute = 'not-data-testid'
      configure({testIdAttribute})

      expect(getConfig().testIdAttribute).toBe(testIdAttribute)
    })

    test('configure can set by a function', () => {
      // setup base option
      const baseTestIdAttribute = 'data-testid'
      configure({testIdAttribute: baseTestIdAttribute})

      const modifiedPrefix = 'modified-'
      configure(existingConfig => ({
        testIdAttribute: `${modifiedPrefix}${existingConfig.testIdAttribute}`,
      }))

      expect(getConfig().testIdAttribute).toBe(
        `${modifiedPrefix}${baseTestIdAttribute}`,
      )
    })
  })

  describe('RTL options', () => {
    test('configure can set by a plain JS object', () => {
      configure({reactStrictMode: true})

      expect(getConfig().reactStrictMode).toBe(true)
    })

    test('configure can set by a function', () => {
      configure(existingConfig => ({
        reactStrictMode: !existingConfig.reactStrictMode,
      }))

      expect(getConfig().reactStrictMode).toBe(true)
    })
  })

  test('configure can set DTL and RTL options at once', () => {
    const testIdAttribute = 'not-data-testid'
    configure({testIdAttribute, reactStrictMode: true})

    expect(getConfig().testIdAttribute).toBe(testIdAttribute)
    expect(getConfig().reactStrictMode).toBe(true)
  })
})
