import React from 'react'
import 'jest-dom/extend-expect'
import {render, cleanup, getByTestId} from 'react-testing-library'
import {IntlProvider, FormattedDate} from 'react-intl'
import IntlPolyfill from 'intl'
import 'intl/locale-data/jsonp/pt'

const setupTests = () => {
  // Test enviroment run as server enviroment and should have polyfill to locale
  // https://formatjs.io/guides/runtime-environments/#server
  if (global.Intl) {
    Intl.NumberFormat = IntlPolyfill.NumberFormat
    Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat
  } else {
    global.Intl = require('intl')
  }
}

const FormatDateView = () => {
  return (
    <div data-testid="date-display">
      <FormattedDate
        value="2019-03-11"
        timeZone="utc"
        day="2-digit"
        month="2-digit"
        year="numeric"
      />
    </div>
  )
}

const renderWithReactIntl = component => {
  return {
    ...render(<IntlProvider locale="pt">{component}</IntlProvider>),
  }
}

setupTests()
afterEach(cleanup)

test('it should render FormattedDate and have a formated pt date', () => {
  const {container} = renderWithReactIntl(<FormatDateView />)
  expect(getByTestId(container, 'date-display')).toHaveTextContent('11/03/2019')
})
