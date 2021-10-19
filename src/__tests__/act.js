import * as React from 'react'
import {act, render, fireEvent, screen} from '../'

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
  render(<div ref={ref} data-testid="foo" />)
  expect(await screen.findByTestId('foo')).toBe(ref.current)
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

test('cleans up IS_REACT_ACT_ENVIRONMENT if its callback throws', () => {
  global.IS_REACT_ACT_ENVIRONMENT = false

  expect(() =>
    act(() => {
      throw new Error('threw')
    }),
  ).toThrow('threw')

  expect(global.IS_REACT_ACT_ENVIRONMENT).toEqual(false)
})

test('cleans up IS_REACT_ACT_ENVIRONMENT if its async callback throws', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = false

  await expect(() =>
    act(async () => {
      throw new Error('thenable threw')
    }),
  ).rejects.toThrow('thenable threw')

  expect(global.IS_REACT_ACT_ENVIRONMENT).toEqual(false)
})
