import {useState} from 'react'
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
