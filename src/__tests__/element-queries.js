import React from 'react'
import {render} from '../'

test('query can return null', () => {
  const {
    queryByLabelText,
    queryByPlaceholderText,
    queryByText,
    queryByTestId,
  } = render(<div />)
  expect(queryByTestId('LucyRicardo')).toBeNull()
  expect(queryByLabelText('LucyRicardo')).toBeNull()
  expect(queryByPlaceholderText('LucyRicardo')).toBeNull()
  expect(queryByText('LucyRicardo')).toBeNull()
})

test('queryAllByTestId returns an empty node list', () => {
  const {queryAllByTestId} = render(<div />)
  const results = queryAllByTestId('LucyRicardo')
  expect(results).toBeInstanceOf(NodeList)
  expect(results.length).toBe(0)
})

test('getAllByTestId throws a useful error message if no matching elements are found', () => {
  const {getAllByTestId} = render(<div />)
  expect(() => getAllByTestId('LucyRicardo')).toThrowErrorMatchingSnapshot()
})

test('getAllByTestId returns a node list of elements if they are found', () => {
  const {getAllByTestId} = render(
    <div>
      <ul>
        <li data-testid="LucyRicardo" />
        <li data-testid="LucyRicardo" />
      </ul>
    </div>,
  )

  const results = getAllByTestId('LucyRicardo')
  expect(results).toBeInstanceOf(NodeList)
  expect(results.length).toBe(2)
})

test('get throws a useful error message', () => {
  const {getByLabelText, getByPlaceholderText, getByText, getByTestId} = render(
    <div />,
  )
  expect(() => getByLabelText('LucyRicardo')).toThrowErrorMatchingSnapshot()
  expect(() =>
    getByPlaceholderText('LucyRicardo'),
  ).toThrowErrorMatchingSnapshot()
  expect(() => getByText('LucyRicardo')).toThrowErrorMatchingSnapshot()
  expect(() => getByTestId('LucyRicardo')).toThrowErrorMatchingSnapshot()
})

test('get can get form controls by label text', () => {
  const {getByLabelText} = render(
    <div>
      <label>
        1st<input id="first-id" />
      </label>
      <div>
        <label htmlFor="second-id">2nd</label>
        <input id="second-id" />
      </div>
      <div>
        <label id="third-label">3rd</label>
        <input aria-labelledby="third-label" id="third-id" />
      </div>
    </div>,
  )
  expect(getByLabelText('1st').id).toBe('first-id')
  expect(getByLabelText('2nd').id).toBe('second-id')
  expect(getByLabelText('3rd').id).toBe('third-id')
})

test('get can get form controls by placeholder', () => {
  const {getByPlaceholderText} = render(
    <input id="username-id" placeholder="username" />,
  )
  expect(getByPlaceholderText('username').id).toBe('username-id')
})

test('label with no form control', () => {
  const {getByLabelText, queryByLabelText} = render(<label>All alone</label>)
  expect(queryByLabelText('alone')).toBeNull()
  expect(() => getByLabelText('alone')).toThrowErrorMatchingSnapshot()
})

test('totally empty label', () => {
  const {getByLabelText, queryByLabelText} = render(<label />)
  expect(queryByLabelText('')).toBeNull()
  expect(() => getByLabelText('')).toThrowErrorMatchingSnapshot()
})

/* eslint jsx-a11y/label-has-for:0 */
