import React from 'react'
import {renderHook} from '../pure'

// Needs to be changed to 19.0.0 once alpha started.
const isReactExperimental = React.version.startsWith('18.3.0-experimental')
const isReactCanary = React.version.startsWith('18.3.0')

// Needs to be changed to isReactExperimental || isReactCanary once alpha started.
const testGateReact18 = isReactExperimental ? test.skip : test

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

      // eslint-disable-next-line jest/no-if, jest/no-conditional-in-test -- false-positive
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

testGateReact18('legacyRoot uses legacy ReactDOM.render', () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  let result
  expect(() => {
    result = renderHook(
      () => {
        return React.useContext(Context)
      },
      {
        wrapper: Wrapper,
        legacyRoot: true,
      },
    ).result
  }).toErrorDev(
    isReactCanary
      ? [
          "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://react.dev/link/switch-to-createroot",
        ]
      : [
          "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
        ],
    {withoutStack: true},
  )
  expect(result.current).toEqual('provided')
})
