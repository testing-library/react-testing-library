import * as React from 'react'
import ReactDOM from 'react-dom'
import {render, screen} from '../'

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

test('throws if `legacyRoot: false` is used with an incomaptible version', () => {
  const isConcurrentReact = typeof ReactDOM.createRoot === 'function'

  const performConcurrentRender = () => render(<div />, {legacyRoot: false})

  // eslint-disable-next-line jest/no-if -- jest doesn't support conditional tests
  if (isConcurrentReact) {
    // eslint-disable-next-line jest/no-conditional-expect -- yes, jest still doesn't support conditional tests
    expect(performConcurrentRender).not.toThrow()
  } else {
    // eslint-disable-next-line jest/no-conditional-expect -- yes, jest still doesn't support conditional tests
    expect(performConcurrentRender).toThrowError(
      `Attempted to use concurrent React with \`react-dom@${ReactDOM.version}\`. Be sure to use the \`next\` or \`experimental\` release channel (https://reactjs.org/docs/release-channels.html).`,
    )
  }
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
