import React from 'react'
import {render, Simulate} from '../'

const StateContext = React.createContext()

const MyButton = () => (
  <StateContext.Consumer>
    {({handleToggle}) => (
      <button data-testid="button" onClick={handleToggle}>
        Push Me
      </button>
    )}
  </StateContext.Consumer>
)

const SecretMessage = () => (
  <StateContext.Consumer>
    {({toggleStatus}) => (
      <h1 data-testid="message">
        {toggleStatus ? 'Secret Message' : 'Hidden'}
      </h1>
    )}
  </StateContext.Consumer>
)

class Container extends React.Component {
  state = {
    toggleStatus: false,
  }

  handleToggle = () => {
    this.setState(prevState => ({
      toggleStatus: !prevState.toggleStatus,
    }))
  }

  render() {
    return (
      <div>
        <StateContext.Provider
          value={{
            toggleStatus: this.state.toggleStatus,
            handleToggle: this.handleToggle,
          }}
        >
          <MyButton />
          <SecretMessage />
        </StateContext.Provider>
      </div>
    )
  }
}

test('Component renders with the correct message, correctly changes message after clicking butotn', () => {
  const {getByTestId} = render(<Container />)
  expect(getByTestId('message').textContent).toBe('Hidden')
  Simulate.click(getByTestId('button'))
  expect(getByTestId('message').textContent).toBe('Secret Message')
})
