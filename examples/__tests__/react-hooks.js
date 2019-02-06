/*
 * This is the recommended way to test reusable custom react hooks.
 * It is not however recommended to use the testHook utility to test
 * single-use custom hooks. Typically those are better tested by testing
 * the component that is using it.
 */
import {testHook, cleanup} from 'react-testing-library'

import useCounter from '../react-hooks'

afterEach(cleanup)

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
  increment()
  expect(count).toBe(2)
})

test('provides an `decrement` function', () => {
  let count, decrement
  testHook(() => ({count, decrement} = useCounter({step: 2})))

  expect(count).toBe(0)
  decrement()
  expect(count).toBe(-2)
})

test('accepts a default initial value for `step`', () => {
  let count, increment
  testHook(() => ({count, increment} = useCounter({})))

  expect(count).toBe(0)
  increment()
  expect(count).toBe(1)
})
