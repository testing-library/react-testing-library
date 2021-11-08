import React from 'react'
import {renderHook} from '../pure'

test('gives comitted result', () => {
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
