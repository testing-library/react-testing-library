import * as React from 'react'
import {render, screen, fireEvent} from '../'

let mockActDepth = 0
let mockMaxActDepth = 0
jest.mock('react', () => {
  const actual = jest.requireActual('react')
  return {
    ...actual,
    act: jest.fn(cb => {
      mockActDepth++
      mockMaxActDepth = Math.max(mockMaxActDepth, mockActDepth)
      try {
        return actual.act(cb)
      } finally {
        mockActDepth--
      }
    }),
  }
})

function Nested() {
  return (
    <>
      <input
        aria-label="outer"
        onFocus={() =>
          fireEvent.change(screen.getByLabelText('inner'), {
            target: {value: 'changed'},
          })
        }
      />
      <input aria-label="inner" />
    </>
  )
}

test('eventWrapper does not nest `act` for a re-entrant event dispatch', () => {
  render(<Nested />)
  expect(screen.getByLabelText('inner').value).toBe('')

  mockMaxActDepth = 0
  fireEvent.focus(screen.getByLabelText('outer'))

  expect(screen.getByLabelText('inner').value).toBe('changed')
  expect(mockMaxActDepth).toBe(1)
})
