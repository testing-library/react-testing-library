import React from 'react'
import {renderIntoDocument, cleanup} from '../'

beforeEach(cleanup)

it('renders button into document', () => {
  const ref = React.createRef()
  const {container} = renderIntoDocument(<div ref={ref} />)
  expect(container.firstChild).toBe(ref.current)
})

it('cleansup document', () => {
  const spy = jest.fn()

  class Test extends React.Component {
    componentWillUnmount() {
      spy()
    }

    render() {
      return <div />
    }
  }

  renderIntoDocument(<Test />)
  cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})
