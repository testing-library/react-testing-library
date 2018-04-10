import React from 'react'
import {renderIntoDocument, clearDocument} from '../'

afterEach(clearDocument)

it('renders button into document', () => {
  const ref = React.createRef()
  renderIntoDocument(<div id="test" ref={ref} />)
  expect(document.body.querySelector('#test')).toBe(ref.current)
})

it('clears document body', () => {
  renderIntoDocument(<div id="test" />)
  clearDocument()
  expect(document.body.innerHTML).toBe('')
})
