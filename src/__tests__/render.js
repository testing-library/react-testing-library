import React from 'react'
import {render, cleanup} from '../'

afterEach(cleanup)

class Portal extends React.Component {
  componentDidMount() {
    const portalEl = document.createElement('div')
    portalEl.appendChild(document.createTextNode('Hello World'))
    document.body.appendChild(portalEl)
  }

  render() {
    return <div />
  }
}

it('renders button into document', () => {
  const ref = React.createRef()
  const {container} = render(<div ref={ref} />)
  expect(container.firstChild).toBe(ref.current)
})

it('access portal elements inside body', () => {
  const {getByText} = render(<Portal />)
  expect(getByText('Hello World')).not.toBeNull()
  document.body.innerHTML = ''
})

it('returns baseElement including the Portal DOM', () => {
  const {baseElement} = render(<Portal />)
  expect(baseElement.nodeName).toEqual('HTML')
  expect(baseElement.children[1].innerHTML).toBe(
    '<div><div></div></div><div>Hello World</div>',
  )
  document.body.innerHTML = ''
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
