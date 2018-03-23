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
        <button onClick={this.fetch}>Fetch</button>
        {data ? <span>{data.greeting}</span> : null}
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
  const {getByText, container} = render(<Fetch url={url} />)

  // Act
  Simulate.click(getByText('Fetch'))

  await flushPromises()

  // Assert
  expect(axiosMock.get).toHaveBeenCalledTimes(1)
  expect(axiosMock.get).toHaveBeenCalledWith(url)
  // this assertion is funny because if the textContent were not "hello there"
  // then the `getByText` would throw anyway... 🤔
  expect(getByText('hello there').textContent).toBe('hello there')
  expect(container.firstChild).toMatchSnapshot()
})
