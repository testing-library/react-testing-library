import 'jest-dom/extend-expect'
import React from 'react'
import ReactDOM from 'react-dom'
import {render, cleanup} from '../'

afterEach(cleanup)

test('renders div into document', () => {
  const ref = React.createRef()
  const {container} = render(<div ref={ref} />)
  expect(container.firstChild).toBe(ref.current)
})

test('works great with react portals', () => {
  class MyPortal extends React.Component {
    constructor(...args) {
      super(...args)
      this.portalNode = document.createElement('div')
      this.portalNode.dataset.testid = 'my-portal'
    }
    componentDidMount() {
      document.body.appendChild(this.portalNode)
    }
    componentWillUnmount() {
      this.portalNode.parentNode.removeChild(this.portalNode)
    }
    render() {
      return ReactDOM.createPortal(
        <Greet greeting="Hello" subject="World" />,
        this.portalNode,
      )
    }
  }

  function Greet({greeting, subject}) {
    return (
      <div>
        <strong>
          {greeting} {subject}
        </strong>
      </div>
    )
  }

  const {unmount, getByTestId, getByText} = render(<MyPortal />)
  expect(getByText('Hello World')).toBeInTheDocument()
  const portalNode = getByTestId('my-portal')
  expect(portalNode).toBeInTheDocument()
  unmount()
  expect(portalNode).not.toBeInTheDocument()
})

test('returns baseElement which defaults to document.body', () => {
  const {baseElement} = render(<div />)
  expect(baseElement).toBe(document.body)
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
