import 'jest-dom/extend-expect'
import React from 'react'
import {render, cleanup, fireEvent} from '../'

afterEach(cleanup)

test('render calls useEffect immediately', () => {
  const effectCb = jest.fn()
  function MyUselessComponent() {
    React.useEffect(effectCb)
    return null
  }
  render(<MyUselessComponent />)
  expect(effectCb).toHaveBeenCalledTimes(1)
})

test('findByTestId returns the element', async () => {
  const ref = React.createRef()
  const {findByTestId} = render(<div ref={ref} data-testid="foo" />)
  expect(await findByTestId('foo')).toBe(ref.current)
})

test('fireEvent triggers useEffect calls', () => {
  const effectCb = jest.fn()
  function Counter() {
    React.useEffect(effectCb)
    const [count, setCount] = React.useState(0)
    return <button onClick={() => setCount(count + 1)}>{count}</button>
  }
  const {
    container: {firstChild: buttonNode},
  } = render(<Counter />)

  effectCb.mockClear()
  fireEvent.click(buttonNode)
  expect(buttonNode).toHaveTextContent('1')
  expect(effectCb).toHaveBeenCalledTimes(1)
})

test('calls to hydrate will run useEffects', () => {
  const effectCb = jest.fn()
  function MyUselessComponent() {
    React.useEffect(effectCb)
    return null
  }
  render(<MyUselessComponent />, {hydrate: true})
  expect(effectCb).toHaveBeenCalledTimes(1)
})
