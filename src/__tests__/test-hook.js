import {useState, useEffect} from 'react'
import 'jest-dom/extend-expect'
import {testHook, cleanup} from '../'

afterEach(cleanup)

test('testHook calls the callback', () => {
  const spy = jest.fn()
  testHook(spy)
  expect(spy).toHaveBeenCalledTimes(1)
})
test('confirm we can safely call a React Hook from within the callback', () => {
  testHook(() => useState())
})
test('returns a function to unmount component', () => {
  let isMounted
  const {unmount} = testHook(() => {
    useEffect(() => {
      isMounted = true
      return () => {
        isMounted = false
      }
    })
  })
  expect(isMounted).toBe(true)
  unmount()
  expect(isMounted).toBe(false)
})
test('returns a function to rerender component', () => {
  let renderCount = 0
  const {rerender} = testHook(() => {
    useEffect(() => {
      renderCount++
    })
  })

  expect(renderCount).toBe(1)
  rerender()
  expect(renderCount).toBe(2)
})
