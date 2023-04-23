import * as React from 'react'
import {render, screen} from '../'

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})

test('debug pretty prints the container', async () => {
  const HelloWorld = () => <h1>Hello World</h1>
  const {debug} = await render(<HelloWorld />)
  debug()
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

test('debug pretty prints multiple containers', async () => {
  const HelloWorld = () => (
    <>
      <h1 data-testid="testId">Hello World</h1>
      <h1 data-testid="testId">Hello World</h1>
    </>
  )
  const {debug} = await render(<HelloWorld />)
  const multipleElements = screen.getAllByTestId('testId')
  debug(multipleElements)

  expect(console.log).toHaveBeenCalledTimes(2)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

test('allows same arguments as prettyDOM', async () => {
  const HelloWorld = () => <h1>Hello World</h1>
  const {debug, container} = await render(<HelloWorld />)
  debug(container, 6, {highlight: false})
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log.mock.calls[0]).toMatchInlineSnapshot(`
    [
      <div>
    ...,
    ]
  `)
})

/*
eslint
  no-console: "off",
*/
