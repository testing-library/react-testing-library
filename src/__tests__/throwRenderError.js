import React from 'react'
import {render} from '../'

global.console = {
  error: jest.fn(),
}

const errorMessage = 'Please provide child component.'

class ErrorComponent extends React.Component {
  componentWillMount() {
    if (!this.props.children) {
      // eslint-disable-next-line
      console.error(errorMessage)
    }
  }
  render() {
    return this.props.children
  }
}

test('should throw render error by default', () => {
  expect(() => {
    render(<ErrorComponent />)
  }).toThrow()
})

test('should silently fail rendering and log component implemented error when throwRenderError is false.', () => {
  render(<ErrorComponent />, {throwRenderError: false})
  expect(global.console.error).toHaveBeenCalledWith(errorMessage)
})

test('should throw render error when throwRenderError is true', () => {
  expect(() => {
    render(<ErrorComponent />, {throwRenderError: true})
  }).toThrow()
})
