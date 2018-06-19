import React from 'react'
import {render, cleanup} from '../'

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  console.log.mockRestore()
})

test('debug pretty prints the container', () => {
  const HelloWorld = () => <h1>Hello World</h1>
  const {debug} = render(<HelloWorld />)
  debug()
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

/* eslint no-console:0 */
