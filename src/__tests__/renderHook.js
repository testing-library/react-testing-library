import React from 'react'
import {renderHook} from '../pure'

test('gives committed result', () => {
  const {result} = renderHook(() => {
    const [state, setState] = React.useState(1)

    React.useEffect(() => {
      setState(2)
    }, [])

    return [state, setState]
  })

  expect(result.current).toEqual([2, expect.any(Function)])
})

test('allows rerendering', () => {
  const {result, rerender} = renderHook(
    ({branch}) => {
      const [left, setLeft] = React.useState('left')
      const [right, setRight] = React.useState('right')

      // eslint-disable-next-line jest/no-if
      switch (branch) {
        case 'left':
          return [left, setLeft]
        case 'right':
          return [right, setRight]

        default:
          throw new Error(
            'No Props passed. This is a bug in the implementation',
          )
      }
    },
    {initialProps: {branch: 'left'}},
  )

  expect(result.current).toEqual(['left', expect.any(Function)])

  rerender({branch: 'right'})

  expect(result.current).toEqual(['right', expect.any(Function)])
})

test('allows wrapper components', async () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  const {result} = renderHook(
    () => {
      return React.useContext(Context)
    },
    {
      wrapper: Wrapper,
    },
  )

  expect(result.current).toEqual('provided')
})

test('passes initialProps to a wrapper component', async () => {
  const Context = React.createContext('default')
  function Wrapper({value, children}) {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }
  const initialProps = {value: 'provided'}
  const {result} = renderHook(
    () => {
      return React.useContext(Context)
    },
    {
      wrapper: Wrapper,
      initialProps,
    },
  )

  expect(result.current).toEqual('provided')
})

test('rerenders wrapper with given props', async () => {
  const Context = React.createContext('default')
  function Wrapper({value, children}) {
    return <Context.Provider value={value}>{children}</Context.Provider>
  }
  const initialProps = {value: 'initial'}
  const {result, rerender} = renderHook(
    () => {
      return React.useContext(Context)
    },
    {
      wrapper: Wrapper,
      initialProps,
    },
  )

  expect(result.current).toEqual('initial')

  rerender({value: 'updated'})

  expect(result.current).toEqual('updated')
})

test('legacyRoot uses legacy ReactDOM.render', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  const {result} = renderHook(
    () => {
      return React.useContext(Context)
    },
    {
      wrapper: Wrapper,
      legacyRoot: true,
    },
  )

  expect(result.current).toEqual('provided')

  expect(console.error).toHaveBeenCalledTimes(1)
  expect(console.error).toHaveBeenNthCalledWith(
    1,
    "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
  )
})
