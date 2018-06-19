// This is an example of how to update the props of a rendered component.
// the basic idea is to simply call `render` again and provide the same container
// that your first call created for you.

import React from 'react'
import {render, cleanup} from 'react-testing-library'

let idCounter = 1

class NumberDisplay extends React.Component {
  id = idCounter++ // to ensure we don't remount a different instance
  render() {
    return (
      <div>
        <span data-testid="number-display">{this.props.number}</span>
        <span data-testid="instance-id">{this.id}</span>
      </div>
    )
  }
}

afterEach(cleanup)

test('calling render with the same component on the same container does not remount', () => {
  const {getByTestId, rerender} = render(<NumberDisplay number={1} />)
  expect(getByTestId('number-display').textContent).toBe('1')

  // re-render the same component with different props
  rerender(<NumberDisplay number={2} />)
  expect(getByTestId('number-display').textContent).toBe('2')

  expect(getByTestId('instance-id').textContent).toBe('1')
})
