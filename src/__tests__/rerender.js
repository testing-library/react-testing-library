import React from 'react'
import {render, cleanup} from '../'
import 'jest-dom/extend-expect'

afterEach(cleanup)

test('rerender will re-render the element', () => {
  const Greeting = props => <div>{props.message}</div>
  const {container, rerender} = render(<Greeting message="hi" />)
  expect(container.firstChild).toHaveTextContent('hi')
  rerender(<Greeting message="hey" />)
  expect(container.firstChild).toHaveTextContent('hey')
})

test('hydrate will not update props until next render', () => {
  const initial = '<input />'

  const container = document.body.appendChild(document.createElement('div'))
  container.innerHTML = initial
  const input = container.querySelector('input')
  const firstValue = 'hello'

  if (!input) throw new Error('No element')
  input.value = firstValue
  const {rerender} = render(<input value="" onChange={() => null} />, {
    container,
    hydrate: true,
  })

  const secondValue = 'goodbye'

  expect(input.value).toBe(firstValue)
  rerender(<input value={secondValue} onChange={() => null} />)
  expect(input.value).toBe(secondValue)
})
