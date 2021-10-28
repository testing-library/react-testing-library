import '@testing-library/jest-dom/extend-expect'

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = false
})
