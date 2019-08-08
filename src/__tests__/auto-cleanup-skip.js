import React from 'react'

let render
beforeAll(() => {
  process.env.RTL_SKIP_CLEANUP = 'true'
  const rtl = require('../')
  render = rtl.render
})

// This one verifies that if RTL_SKIP_CLEANUP is set
// that we DON'T auto-wire up the afterEach for folks
test('first', () => {
  render(<div>hi</div>)
})

test('second', () => {
  expect(document.body.innerHTML).toEqual('<div><div>hi</div></div>')
})
