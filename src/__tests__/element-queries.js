import React from 'react'
import {render} from '../'
import '../extend-expect'

test('query can return null', () => {
  const {
    queryByLabelText,
    queryByPlaceholderText,
    queryByText,
    queryByTestId,
    queryByAltText,
  } = render(<div />)
  expect(queryByTestId('LucyRicardo')).toBeNull()
  expect(queryByLabelText('LucyRicardo')).toBeNull()
  expect(queryByPlaceholderText('LucyRicardo')).toBeNull()
  expect(queryByText('LucyRicardo')).toBeNull()
  expect(queryByAltText('LucyRicardo')).toBeNull()
})

test('get throws a useful error message', () => {
  const {
    getByLabelText,
    getByPlaceholderText,
    getByText,
    getByTestId,
    getByAltText,
  } = render(<div />)
  expect(() => getByLabelText('LucyRicardo')).toThrowErrorMatchingSnapshot()
  expect(() =>
    getByPlaceholderText('LucyRicardo'),
  ).toThrowErrorMatchingSnapshot()
  expect(() => getByText('LucyRicardo')).toThrowErrorMatchingSnapshot()
  expect(() => getByTestId('LucyRicardo')).toThrowErrorMatchingSnapshot()
  expect(() => getByAltText('LucyRicardo')).toThrowErrorMatchingSnapshot()
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

test('getByLabelText with aria-label', () => {
  // not recommended normally, but supported for completeness
  const {queryByLabelText} = render(<input aria-label="batman" />)
  expect(queryByLabelText('bat')).toBeInTheDOM()
})

test('get element by its alt text', () => {
  const {getByAltText} = render(
    <div>
      <input data-info="no alt here" />
      <img alt="finding nemo poster" src="/finding-nemo.png" />
    </div>,
  )
  expect(getByAltText(/fin.*nem.*poster$/i).src).toBe('/finding-nemo.png')
})

test('using jest helpers to assert element states', () => {
  const {queryByTestId} = render(<span data-testid="count-value">2</span>)

  // other ways to assert your test cases, but you don't need all of them.
  expect(queryByTestId('count-value')).toBeInTheDOM()
  expect(queryByTestId('count-value1')).not.toBeInTheDOM()
  expect(queryByTestId('count-value')).toHaveTextContent('2')
  expect(queryByTestId('count-value')).not.toHaveTextContent('21')
  expect(() =>
    expect(queryByTestId('count-value2')).toHaveTextContent('2'),
  ).toThrowError()

  // negative test cases wrapped in throwError assertions for coverage.
  expect(() =>
    expect(queryByTestId('count-value')).not.toBeInTheDOM(),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('count-value1')).toBeInTheDOM(),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('count-value')).toHaveTextContent('3'),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('count-value')).not.toHaveTextContent('2'),
  ).toThrowError()

  expect(() =>
    expect({thisIsNot: 'an html element'}).toBeInTheDOM(),
  ).toThrowError()
})

test('using jest helpers to check element attributes', () => {
  const {queryByTestId} = render(
    <button data-testid="ok-button" type="submit" disabled>
      OK
    </button>,
  )

  expect(queryByTestId('ok-button')).toHaveAttribute('disabled')
  expect(queryByTestId('ok-button')).toHaveAttribute('type')
  expect(queryByTestId('ok-button')).not.toHaveAttribute('class')
  expect(queryByTestId('ok-button')).toHaveAttribute('type', 'submit')
  expect(queryByTestId('ok-button')).not.toHaveAttribute('type', 'button')

  expect(() =>
    expect(queryByTestId('ok-button')).not.toHaveAttribute('disabled'),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('ok-button')).not.toHaveAttribute('type'),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('ok-button')).toHaveAttribute('class'),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('ok-button')).not.toHaveAttribute('type', 'submit'),
  ).toThrowError()
  expect(() =>
    expect(queryByTestId('ok-button')).toHaveAttribute('type', 'button'),
  ).toThrowError()
})

/* eslint jsx-a11y/label-has-for:0 */
