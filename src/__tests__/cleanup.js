import React from 'react'
import {render, cleanup} from '../'

test('cleans up the document', async () => {
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
  await cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup does not error when an element is not a child', async () => {
  render(<div />, {container: document.createElement('div')})
  await cleanup()
})

test('cleanup waits for queued microtasks during unmount sequence', async () => {
  const spy = jest.fn()

  const Test = () => {
    React.useEffect(() => () => setImmediate(spy))

    return null
  }

  render(<Test />)
  await cleanup()
  expect(spy).toHaveBeenCalledTimes(1)
})
