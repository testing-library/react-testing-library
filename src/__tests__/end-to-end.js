import * as React from 'react'
import {render, waitForElementToBeRemoved, screen, waitFor} from '../'

const fetchAMessage = () =>
  new Promise(resolve => {
    // we are using random timeout here to simulate a real-time example
    // of an async operation calling a callback at a non-deterministic time
    const randomTimeout = Math.floor(Math.random() * 100)
    setTimeout(() => {
      resolve({returnedMessage: 'Hello World'})
    }, randomTimeout)
  })

class ComponentWithLoader extends React.Component {
  state = {loading: true}
  async componentDidMount() {
    const data = await fetchAMessage()
    this.setState({data, loading: false}) // eslint-disable-line
  }
  render() {
    if (this.state.loading) {
      return <div>Loading...</div>
    }
    return (
      <div data-testid="message">
        Loaded this message: {this.state.data.returnedMessage}!
      </div>
    )
  }
}

describe.each([
  ['real timers', () => jest.useRealTimers()],
  ['fake legacy timers', () => jest.useFakeTimers('legacy')],
  ['fake modern timers', () => jest.useFakeTimers('modern')],
])('it waits for the data to be loaded using %s', (label, useTimers) => {
  beforeEach(() => {
    useTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('waitForElementToBeRemoved', async () => {
    render(<ComponentWithLoader />)
    const loading = () => screen.getByText('Loading...')
    await waitForElementToBeRemoved(loading)
    expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
  })

  test('waitFor', async () => {
    render(<ComponentWithLoader />)
    const message = () => screen.getByText(/Loaded this message:/)
    await waitFor(message)
    expect(screen.getByTestId('message')).toHaveTextContent(/Hello World/)
  })

  test('findBy', async () => {
    render(<ComponentWithLoader />)
    await expect(screen.findByTestId('message')).resolves.toHaveTextContent(
      /Hello World/,
    )
  })
})
