import React from 'react'
import {act, render, cleanup} from '../'

test('simple render works like legacy', () => {
  const {container} = render(<div>test</div>, {root: 'concurrent'})

  expect(container).toHaveTextContent('test')
})

test('unmounts are flushed in sync', () => {
  const {container, unmount} = render(<div>test</div>, {root: 'concurrent'})

  unmount()

  expect(container.children).toHaveLength(0)
})

test('rerender are flushed in sync', () => {
  const {container, rerender} = render(<div>foo</div>, {root: 'concurrent'})

  rerender(<div>bar</div>)

  expect(container).toHaveTextContent('foo')
})

test('cleanup unmounts in sync', () => {
  const {container} = render(<div>test</div>, {root: 'concurrent'})

  cleanup()

  expect(container.children).toHaveLength(0)
})

test('state updates are concurrent', () => {
  function TrackingButton() {
    const [clickCount, increment] = React.useReducer(n => n + 1, 0)

    return (
      <button type="button" onClick={increment}>
        Clicked {clickCount} times.
      </button>
    )
  }
  const {getByRole} = render(<TrackingButton />, {root: 'concurrent'})

  act(() => {
    getByRole('button').click()
    expect(getByRole('button')).toHaveTextContent('Clicked 0 times')
  })

  expect(getByRole('button')).toHaveTextContent('Clicked 1 times')
})
