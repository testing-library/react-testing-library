import React from 'react'
import {renderIntoDocument, clearDocument} from '../'

afterEach(clearDocument)

it('renders button into document', () => {
  const ref = React.createRef()
  const {container} = renderIntoDocument(<div ref={ref} />)
  expect(container.firstChild).toBe(ref.current)
})

it('clears document body', () => {
  renderIntoDocument(<div />)
  clearDocument()
  expect(document.body.innerHTML).toBe('')
})
