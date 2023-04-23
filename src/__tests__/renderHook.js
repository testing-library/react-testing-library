import * as React from 'react'
import {configure, renderHook} from '../'

const isReact18 = React.version.startsWith('18.')
const isReact19 = React.version.startsWith('19.')

const testGateReact18 = isReact18 ? test : test.skip
const testGateReact19 = isReact19 ? test : test.skip

test('gives committed result', async () => {
  const {result} = await renderHook(() => {
    const [state, setState] = React.useState(1)

    React.useEffect(() => {
      setState(2)
    }, [])

    return [state, setState]
  })

  expect(result.current).toEqual([2, expect.any(Function)])
})

test('allows rerendering', async () => {
  const {result, rerender} = await renderHook(
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

  await rerender({branch: 'right'})

  expect(result.current).toEqual(['right', expect.any(Function)])
})

test('allows wrapper components', async () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  const {result} = await renderHook(
    () => {
      return React.useContext(Context)
    },
    {
      wrapper: Wrapper,
    },
  )

  expect(result.current).toEqual('provided')
})

testGateReact18('legacyRoot uses legacy ReactDOM.render', async () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  let result
  await expect(async () => {
    result = (
      await renderHook(
        () => {
          return React.useContext(Context)
        },
        {
          wrapper: Wrapper,
          legacyRoot: true,
        },
      )
    ).result
  }).toErrorDev(
    [
      "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
    ],
    {withoutStack: true},
  )

  expect(result.current).toEqual('provided')
})

testGateReact19('legacyRoot throws', async () => {
  const Context = React.createContext('default')
  function Wrapper({children}) {
    return <Context.Provider value="provided">{children}</Context.Provider>
  }
  await expect(async () => {
    await renderHook(
      () => {
        return React.useContext(Context)
      },
      {
        wrapper: Wrapper,
        legacyRoot: true,
      },
    )
  }).rejects.toThrowErrorMatchingInlineSnapshot(
    `\`legacyRoot: true\` is not supported in this version of React. If your app runs React 19 or later, you should remove this flag. If your app runs React 18 or earlier, visit https://react.dev/blog/2022/03/08/react-18-upgrade-guide for upgrade instructions.`,
  )
})

describe('reactStrictMode', () => {
  let originalConfig
  beforeEach(() => {
    // Grab the existing configuration so we can restore
    // it at the end of the test
    configure(existingConfig => {
      originalConfig = existingConfig
      // Don't change the existing config
      return {}
    })
  })

  afterEach(() => {
    configure(originalConfig)
  })

  test('reactStrictMode in renderOptions has precedence over config when rendering', async () => {
    const hookMountEffect = jest.fn()
    configure({reactStrictMode: false})

    await renderHook(() => React.useEffect(() => hookMountEffect()), {
      reactStrictMode: true,
    })

    expect(hookMountEffect).toHaveBeenCalledTimes(2)
  })
})
