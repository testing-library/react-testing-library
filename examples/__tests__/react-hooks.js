/*
 * This is the recommended way to test reusable custom react hooks.
 * It is not however recommended to use the testHook utility to test
 * single-use custom hooks. Typically those are better tested by testing
 * the component that is using it.
 */
import {testHook, act, cleanup} from 'react-testing-library'

import {useCounter, useDocumentTitle, useCall} from '../react-hooks'

afterEach(cleanup)

describe('useCounter', () => {
  test('accepts default initial values', () => {
    let count
    testHook(() => ({count} = useCounter()))

    expect(count).toBe(0)
  })

  test('accepts a default initial value for `count`', () => {
    let count
    testHook(() => ({count} = useCounter({})))

    expect(count).toBe(0)
  })

  test('provides an `increment` function', () => {
    let count, increment
    testHook(() => ({count, increment} = useCounter({step: 2})))

    expect(count).toBe(0)
    act(() => {
      increment()
    })
    expect(count).toBe(2)
  })

  test('provides an `decrement` function', () => {
    let count, decrement
    testHook(() => ({count, decrement} = useCounter({step: 2})))

    expect(count).toBe(0)
    act(() => {
      decrement()
    })
    expect(count).toBe(-2)
  })

  test('accepts a default initial value for `step`', () => {
    let count, increment
    testHook(() => ({count, increment} = useCounter({})))

    expect(count).toBe(0)
    act(() => {
      increment()
    })
    expect(count).toBe(1)
  })
})

// using unmount function to check useEffect behavior when unmounting
describe('useDocumentTitle', () => {
  test('sets a title', () => {
    document.title = 'original title'
    testHook(() => {
      useDocumentTitle('modified title')
    })

    expect(document.title).toBe('modified title')
  })

  test('returns to original title when component is unmounted', () => {
    document.title = 'original title'
    const {unmount} = testHook(() => {
      useDocumentTitle('modified title')
    })

    unmount()
    expect(document.title).toBe('original title')
  })
})

// using rerender function to test calling useEffect multiple times
describe('useCall', () => {
  test('calls once on render', () => {
    const spy = jest.fn()
    testHook(() => {
      useCall(spy, [])
    })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('calls again if deps change', () => {
    let deps = [false]
    const spy = jest.fn()
    const {rerender} = testHook(() => {
      useCall(spy, deps)
    })
    expect(spy).toHaveBeenCalledTimes(1)

    deps = [true]
    rerender()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  test('does not call again if deps are the same', () => {
    let deps = [false]
    const spy = jest.fn()
    const {rerender} = testHook(() => {
      useCall(spy, deps)
    })
    expect(spy).toHaveBeenCalledTimes(1)

    deps = [false]
    rerender()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
