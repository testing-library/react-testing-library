import React from 'react'
import ReactDOM from 'react-dom'

import {renderHook} from '../pure'

const isReact18 = React.version.startsWith('18.')
const isReact19 = React.version.startsWith('19.')

const testGateReact18 = isReact18 ? test : test.skip
const testGateReact19 = isReact19 ? test : test.skip

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
    [
      "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
    ],
    {withoutStack: true},
  )
  expect(result.current).toEqual('provided')
})

testGateReact19('legacyRoot throws', () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  expect(() => {
    renderHook(
      () => {
        return React.useContext(Context)
      },
      {
        wrapper: Wrapper,
        legacyRoot: true,
      },
    ).result
  }).toThrowErrorMatchingInlineSnapshot(
    `\`legacyRoot: true\` is not supported in this version of React. If your app runs React 19 or later, you should remove this flag. If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.`,
  )
})

test('supports initialArgs for multi-parameter hooks', () => {
  const useTestHook = (a, b, c) => a + b + c
  const {result} = renderHook(useTestHook, {initialArgs: [1, 2, 3]})

  expect(result.current).toBe(6)
})

test('rerender supports multiple parameters', () => {
  const useTestHook = (a, b) => a * b
  const {result, rerender} = renderHook(useTestHook, {initialArgs: [2, 3]})

  expect(result.current).toBe(6)

  rerender(4, 5)
  expect(result.current).toBe(20)
})

test('throws error when both initialProps and initialArgs are used', () => {
  const useTestHook = (a, b) => a + b

  expect(() =>
    renderHook(useTestHook, {initialProps: 1, initialArgs: [2, 3]}),
  ).toThrow('Cannot use both initialProps and initialArgs. Choose one.')
})

test('throws an error when legacyRoot is used in unsupported React versions', () => {
  const useTestHook = () => 'test'

  const {render: originalRender} = ReactDOM

  ReactDOM.render = undefined

  expect(() => {
    renderHook(useTestHook, {legacyRoot: true})
  }).toThrowError(
    '`legacyRoot: true` is not supported in this version of React. ' +
      'If your app runs React 19 or later, you should remove this flag. ' +
      'If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.',
  )

  ReactDOM.render = originalRender
})
