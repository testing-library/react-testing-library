import * as React from 'react'
import {render, fireEvent, screen} from '../'
import {actIfEnabled} from '../act-compat'

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true
})

test('render calls useEffect immediately', async () => {
  const effectCb = jest.fn()
  function MyUselessComponent() {
    React.useEffect(effectCb)
    return null
  }
  await render(<MyUselessComponent />)
  expect(effectCb).toHaveBeenCalledTimes(1)
})

test('findByTestId returns the element', async () => {
  const ref = React.createRef()
  await render(<div ref={ref} data-testid="foo" />)
  expect(await screen.findByTestId('foo')).toBe(ref.current)
})

test('fireEvent triggers useEffect calls', async () => {
  const effectCb = jest.fn()
  function Counter() {
    React.useEffect(effectCb)
    const [count, setCount] = React.useState(0)
    return <button onClick={() => setCount(count + 1)}>{count}</button>
  }
  const {
    container: {firstChild: buttonNode},
  } = await render(<Counter />)

  effectCb.mockClear()
  // eslint-disable-next-line testing-library/no-await-sync-events --  TODO: Remove lint rule.
  await fireEvent.click(buttonNode)
  expect(buttonNode).toHaveTextContent('1')
  expect(effectCb).toHaveBeenCalledTimes(1)
})

test('calls to hydrate will run useEffects', async () => {
  const effectCb = jest.fn()
  function MyUselessComponent() {
    React.useEffect(effectCb)
    return null
  }
  await render(<MyUselessComponent />, {hydrate: true})
  expect(effectCb).toHaveBeenCalledTimes(1)
})

test('cleans up IS_REACT_ACT_ENVIRONMENT if its callback throws', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = false

  await expect(() =>
    actIfEnabled(() => {
      throw new Error('threw')
    }),
  ).rejects.toThrow('threw')

  expect(global.IS_REACT_ACT_ENVIRONMENT).toEqual(false)
})

test('cleans up IS_REACT_ACT_ENVIRONMENT if its async callback throws', async () => {
  global.IS_REACT_ACT_ENVIRONMENT = false

  await expect(() =>
    actIfEnabled(async () => {
      throw new Error('thenable threw')
    }),
  ).rejects.toThrow('thenable threw')

  expect(global.IS_REACT_ACT_ENVIRONMENT).toEqual(false)
})

test('state update from microtask does not trigger "missing act" warning', async () => {
  let triggerStateUpdateFromMicrotask
  function App() {
    const [state, setState] = React.useState(0)
    triggerStateUpdateFromMicrotask = () => setState(1)
    React.useEffect(() => {
      // eslint-disable-next-line jest/no-conditional-in-test
      if (state === 1) {
        Promise.resolve().then(() => {
          setState(2)
        })
      }
    }, [state])
    return state
  }
  const {container} = await render(<App />)

  await actIfEnabled(() => {
    triggerStateUpdateFromMicrotask()
  })

  expect(container).toHaveTextContent('2')
})
