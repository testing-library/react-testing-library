import React from 'react'
import axiosMock from 'axios'
import {render, Simulate, flushPromises} from '../'

// instead of importing it, we'll define it inline here
// import Fetch from '../fetch'

class Fetch extends React.Component {
  state = {}
  componentDidUpdate(prevProps) {
    if (this.props.url !== prevProps.url) {
      this.fetch()
    }
  }
  fetch = async () => {
    const response = await axiosMock.get(this.props.url)
    this.setState({data: response.data})
  }
  render() {
    const {data} = this.state
    return (
      <div>
        <button onClick={this.fetch} data-test="load-greeting">
          Fetch
        </button>
        {data ? <span data-test="greeting-text">{data.greeting}</span> : null}
      </div>
    )
  }
}

test('Fetch makes an API call and displays the greeting when load-greeting is clicked', async () => {
  // Arrange
  axiosMock.get.mockImplementationOnce(() =>
    Promise.resolve({
      data: {greeting: 'hello there'},
    }),
  )
  const url = '/greeting'
  const {queryByTestId, container} = render(<Fetch url={url} />)

  // Act
  Simulate.click(queryByTestId('load-greeting'))

  await flushPromises()

  // Assert
  expect(axiosMock.get).toHaveBeenCalledTimes(1)
  expect(axiosMock.get).toHaveBeenCalledWith(url)
  expect(queryByTestId('greeting-text').textContent).toBe('hello there')
  expect(container.firstChild).toMatchSnapshot()
})
