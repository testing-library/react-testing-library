import * as React from 'react'
import {render} from '../'

// This just verifies that by importing RTL in an
// environment which supports afterEach (like jest)
// we'll get automatic cleanup between tests.
test('first', async () => {
  await render(<div>hi</div>)
})

test('second', () => {
  expect(document.body).toBeEmptyDOMElement()
})
