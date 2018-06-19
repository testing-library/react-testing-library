import React from 'react'
import {render, cleanup, fireEvent} from '../'

afterEach(cleanup)

class StopWatch extends React.Component {
  state = {lapse: 0, running: false}
  handleRunClick = () => {
    this.setState(state => {
      if (state.running) {
        clearInterval(this.timer)
      } else {
        const startTime = Date.now() - this.state.lapse
        this.timer = setInterval(() => {
          this.setState({lapse: Date.now() - startTime})
        })
      }
      return {running: !state.running}
    })
  }
  handleClearClick = () => {
    clearInterval(this.timer)
    this.setState({lapse: 0, running: false})
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  render() {
    const {lapse, running} = this.state
    return (
      <div>
        <span>{lapse}ms</span>
        <button onClick={this.handleRunClick}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button onClick={this.handleClearClick}>Clear</button>
      </div>
    )
  }
}

const wait = time => new Promise(resolve => setTimeout(resolve, time))

test('unmounts a component', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  const {unmount, getByText, container} = render(<StopWatch />)
  fireEvent.click(getByText('Start'))
  unmount()
  // hey there reader! You don't need to have an assertion like this one
  // this is just me making sure that the unmount function works.
  // You don't need to do this in your apps. Just rely on the fact that this works.
  expect(container.innerHTML).toBe('')
  // just wait to see if the interval is cleared or not
  // if it's not, then we'll call setState on an unmounted component
  // and get an error.
  // eslint-disable-next-line no-console
  await wait(() => expect(console.error).not.toHaveBeenCalled())
})
