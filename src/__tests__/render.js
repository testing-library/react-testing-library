import * as React from 'react'
import ReactDOM from 'react-dom'
import ReactDOMServer from 'react-dom/server'
import {fireEvent, render, screen} from '../'

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

  const {unmount} = render(<MyPortal />)
  expect(screen.getByText('Hello World')).toBeInTheDocument()
  const portalNode = screen.getByTestId('my-portal')
  expect(portalNode).toBeInTheDocument()
  unmount()
  expect(portalNode).not.toBeInTheDocument()
})

test('returns baseElement which defaults to document.body', () => {
  const {baseElement} = render(<div />)
  expect(baseElement).toBe(document.body)
})

test('supports fragments', () => {
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
})

test('renders options.wrapper around node', () => {
  const WrapperComponent = ({children}) => (
    <div data-testid="wrapper">{children}</div>
  )

  const {container} = render(<div data-testid="inner" />, {
    wrapper: WrapperComponent,
  })

  expect(screen.getByTestId('wrapper')).toBeInTheDocument()
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      data-testid=wrapper
    >
      <div
        data-testid=inner
      />
    </div>
  `)
})

test('flushes useEffect cleanup functions sync on unmount()', () => {
  const spy = jest.fn()
  function Component() {
    React.useEffect(() => spy, [])
    return null
  }
  const {unmount} = render(<Component />)
  expect(spy).toHaveBeenCalledTimes(0)

  unmount()

  expect(spy).toHaveBeenCalledTimes(1)
})

test('can be called multiple times on the same container', () => {
  const container = document.createElement('div')

  const {unmount} = render(<strong />, {container})

  expect(container).toContainHTML('<strong></strong>')

  render(<em />, {container})

  expect(container).toContainHTML('<em></em>')

  unmount()

  expect(container).toBeEmptyDOMElement()
})

test('hydrate will make the UI interactive', () => {
  function App() {
    const [clicked, handleClick] = React.useReducer(n => n + 1, 0)

    return (
      <button type="button" onClick={handleClick}>
        clicked:{clicked}
      </button>
    )
  }
  const ui = <App />
  const container = document.createElement('div')
  document.body.appendChild(container)
  container.innerHTML = ReactDOMServer.renderToString(ui)

  expect(container).toHaveTextContent('clicked:0')

  render(ui, {container, hydrate: true})

  fireEvent.click(container.querySelector('button'))

  expect(container).toHaveTextContent('clicked:1')
})

test('hydrate can have a wrapper', () => {
  const wrapperComponentMountEffect = jest.fn()
  function WrapperComponent({children}) {
    React.useEffect(() => {
      wrapperComponentMountEffect()
    }, [])

    return children
  }
  const ui = <div />
  const container = document.createElement('div')
  document.body.appendChild(container)
  container.innerHTML = ReactDOMServer.renderToString(ui)

  render(ui, {container, hydrate: true, wrapper: WrapperComponent})

  expect(wrapperComponentMountEffect).toHaveBeenCalledTimes(1)
})

test('legacyRoot uses legacy ReactDOM.render', () => {
  expect(() => {
    render(<div />, {legacyRoot: true})
  }).toErrorDev(
    [
      "Warning: ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
    ],
    {withoutStack: true},
  )
})

test('legacyRoot uses legacy ReactDOM.hydrate', () => {
  const ui = <div />
  const container = document.createElement('div')
  container.innerHTML = ReactDOMServer.renderToString(ui)
  expect(() => {
    render(ui, {container, hydrate: true, legacyRoot: true})
  }).toErrorDev(
    [
      "Warning: ReactDOM.hydrate is no longer supported in React 18. Use hydrateRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot",
    ],
    {withoutStack: true},
  )
})
