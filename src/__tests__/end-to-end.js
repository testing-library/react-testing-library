import React from 'react'
import {render, wait, cleanup} from '../'

afterEach(cleanup)

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

test('it waits for the data to be loaded', async () => {
  const {queryByText, queryByTestId} = render(<ComponentWithLoader />)

  expect(queryByText('Loading...')).toBeTruthy()

  await wait(() => expect(queryByText('Loading...')).toBeNull())
  expect(queryByTestId('message').textContent).toMatch(/Hello World/)
})
