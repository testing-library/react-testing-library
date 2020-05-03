import React from 'react'
import {render, screen} from '../'

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
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

test('debug returns the container', () => {
  const HelloWorld = () => <h1>Hello World</h1>
  const {debug} = render(<HelloWorld />)
  expect(debug()).toMatchInlineSnapshot(`
    "[36m<body>[39m
      [36m<div>[39m
        [36m<h1>[39m
          [0mHello World[0m
        [36m</h1>[39m
      [36m</div>[39m
    [36m</body>[39m"
  `)
})

test('debug pretty prints multiple containers', () => {
  const HelloWorld = () => (
    <>
      <h1 data-testid="testId">Hello World</h1>
      <h1 data-testid="testId">Hello World</h1>
    </>
  )
  const {debug} = render(<HelloWorld />)
  const multipleElements = screen.getAllByTestId('testId')
  debug(multipleElements)

  expect(console.log).toHaveBeenCalledTimes(2)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

test('debug returns multiple containers', () => {
  const HelloWorld = () => (
    <>
      <h1 data-testid="testId">Hello World</h1>
      <h1 data-testid="testId">Hello World</h1>
    </>
  )
  const {debug} = render(<HelloWorld />)
  const multipleElements = screen.getAllByTestId('testId')

  expect(debug(multipleElements)).toMatchInlineSnapshot(`
    Array [
      "[36m<h1[39m
      [33mdata-testid[39m=[32m\\"testId\\"[39m
    [36m>[39m
      [0mHello World[0m
    [36m</h1>[39m",
      "[36m<h1[39m
      [33mdata-testid[39m=[32m\\"testId\\"[39m
    [36m>[39m
      [0mHello World[0m
    [36m</h1>[39m",
    ]
  `)
})

test('allows same arguments as prettyDOM', () => {
  const HelloWorld = () => <h1>Hello World</h1>
  const {debug, container} = render(<HelloWorld />)
  debug(container, 6, {highlight: false})
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log.mock.calls[0]).toMatchInlineSnapshot(`
    Array [
      "<div>
    ...",
    ]
  `)
})

/* eslint no-console:0 */
