import React from 'react'
import {render} from '../'

const TestComponent = () => <span data-testid="test-component" />

test('queryByTestId finds matching element', () => {
  const {queryByTestId} = render(<TestComponent />)
  expect(queryByTestId('test-component')).toMatchSnapshot()
})

test('queryByTestId returns null when no matching element exists', () => {
  const {queryByTestId} = render(<TestComponent />)
  expect(queryByTestId('unknown-data-testid')).toBeNull()
})

test('getByTestId finds matching element', () => {
  const {getByTestId} = render(<TestComponent />)
  expect(getByTestId('test-component')).toMatchSnapshot()
})

test('getByTestId throws error when no matching element exists', () => {
  const {getByTestId} = render(<TestComponent />)
  expect(() =>
    getByTestId('unknown-data-testid'),
  ).toThrowErrorMatchingSnapshot()
})
