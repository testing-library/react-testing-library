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
  const divId = 'my-div';

  class Test extends React.Component {
    componentWillUnmount() {
      expect(document.getElementById(divId)).toBeInTheDocument()
      spy()
    }

    render() {
      return <div id={divId}/>
    }
  }

  render(<Test />)
  cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})

it('supports fragments', () => {
  class Test extends React.Component {
    render() {
      return (
        <div>
          <code>DocumentFragment</code> is pretty cool!
        </div>
      )
    }
  }

  const {asFragment} = render(<Test />)
  expect(asFragment()).toMatchSnapshot()
  cleanup()
  expect(document.body.innerHTML).toBe('')
})

test('renders options.wrapper around node', () => {
  const WrapperComponent = ({children}) => (
    <div data-testid="wrapper">{children}</div>
  )

  const {container, getByTestId} = render(<div data-testid="inner" />, {
    wrapper: WrapperComponent,
  })

  expect(getByTestId('wrapper')).toBeInTheDocument()
  expect(container.firstChild).toMatchInlineSnapshot(`
<div
  data-testid="wrapper"
>
  <div
    data-testid="inner"
  />
</div>
`)
})
