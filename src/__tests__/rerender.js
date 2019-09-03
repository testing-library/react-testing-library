import React from 'react'
import {render} from '../'

test('rerender will re-render the element', () => {
  const Greeting = props => <div>{props.message}</div>
  const {container, rerender} = render(<Greeting message="hi" />)
  expect(container.firstChild).toHaveTextContent('hi')
  rerender(<Greeting message="hey" />)
  expect(container.firstChild).toHaveTextContent('hey')
})

test('hydrate will not update props until next render', () => {
  const initialInputElement = document.createElement('input')
  const container = document.createElement('div')
  container.appendChild(initialInputElement)
  document.body.appendChild(container)

  const firstValue = 'hello'
  initialInputElement.value = firstValue

  const {rerender} = render(<input value="" onChange={() => null} />, {
    container,
    hydrate: true,
  })

  expect(initialInputElement.value).toBe(firstValue)

  const secondValue = 'goodbye'
  rerender(<input value={secondValue} onChange={() => null} />)
  expect(initialInputElement.value).toBe(secondValue)
})
