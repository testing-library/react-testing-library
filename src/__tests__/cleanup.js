import React from 'react'
import {render, cleanup} from '../'

test('cleans up the document', () => {
  const spy = jest.fn()
  const divId = 'my-div'

  class Test extends React.Component {
    componentWillUnmount() {
      expect(document.getElementById(divId)).toBeInTheDocument()
      spy()
    }

    render() {
      return <div id={divId} />
    }
  }

  render(<Test />)
  cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup does not error when an element is not a child', () => {
  render(<div />, {container: document.createElement('div')})
  cleanup()
})
