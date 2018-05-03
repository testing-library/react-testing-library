import React from 'react'
import {render, cleanup} from '../'
import 'jest-dom/extend-expect'

afterEach(cleanup)

it('rerender will re-render the element', () => {
  const Greeting = props => <div>{props.message}</div>
  const {container, rerender} = render(<Greeting message="hi" />)
  expect(container.firstChild).toHaveTextContent('hi')
  rerender(<Greeting message="hey" />)
  expect(container.firstChild).toHaveTextContent('hey')
})