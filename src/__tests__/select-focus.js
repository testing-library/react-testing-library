import * as React from 'react'
import {render, fireEvent, screen} from '../'

test.each(['input', 'textarea'])(
  'fireEvent.select flushes automatic %s focus and previous blur updates',
  elementType => {
    function Example() {
      const [focused, setFocused] = React.useState(false)
      const [blurred, setBlurred] = React.useState(false)
      return (
        <>
          <input aria-label="previous" onBlur={() => setBlurred(true)} />
          {React.createElement(elementType, {
            'aria-label': 'selection',
            onFocus: () => setFocused(true),
            'data-focused': focused,
            'data-blurred': blurred,
          })}
        </>
      )
    }
    render(<Example />)
    const previous = screen.getByRole('textbox', {name: 'previous'})
    previous.focus()
    const input = screen.getByRole('textbox', {name: 'selection'})
    fireEvent.select(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('data-focused', 'true')
    expect(input).toHaveAttribute('data-blurred', 'true')
  },
)

test('fireEvent.select preserves native focus, selection and key event ordering', () => {
  const events = []
  const handleSelect = jest.fn()
  render(<input aria-label="selection" onSelect={handleSelect} />)
  const input = screen.getByRole('textbox', {name: 'selection'})
  const focusSpy = jest.fn(() => events.push('focus'))
  input.addEventListener('select', () => events.push('select'))
  input.addEventListener('focus', focusSpy)
  input.addEventListener('keyup', () => events.push('keyup'))
  fireEvent.select(input)
  expect(events).toEqual(['select', 'focus', 'keyup'])
  expect(handleSelect).toHaveBeenCalledTimes(1)
  fireEvent.select(input)
  expect(focusSpy).toHaveBeenCalledTimes(1)
})

test('fireEvent.select flushes updates when the input is already focused', () => {
  function Example() {
    const [selected, setSelected] = React.useState(false)
    return (
      <input
        aria-label="selection"
        onSelect={() => setSelected(true)}
        data-selected={selected}
      />
    )
  }
  render(<Example />)
  const input = screen.getByRole('textbox', {name: 'selection'})
  input.focus()
  fireEvent.select(input)
  expect(input).toHaveAttribute('data-selected', 'true')
})
