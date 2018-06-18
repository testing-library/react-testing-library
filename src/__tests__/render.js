import React from 'react'
import {render, cleanup} from '../'

afterEach(cleanup)

it('renders button into document', () => {
  const ref = React.createRef()
  const {container} = render(<div ref={ref} />)
  expect(container.firstChild).toBe(ref.current)
})

it('access portal elements inside body', () => {
  const {getByText} = render(<div />)
  const portalComponent = document.createElement('div')
  portalComponent.appendChild(document.createTextNode('Hello World'))
  document.body.appendChild(portalComponent)
  expect(getByText('Hello World')).not.toBeNull()
  document.body.removeChild(portalComponent)
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

  render(<Test />)
  cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})
