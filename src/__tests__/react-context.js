import React from 'react'
import {render, Simulate} from '../'

const StateContext = React.createContext()

const MyButton = () => (
  <StateContext.Consumer>
    {({handleToggle}) => <button onClick={handleToggle}>Push Me</button>}
  </StateContext.Consumer>
)

const SecretMessage = () => (
  <StateContext.Consumer>
    {({toggleStatus}) => <h1>{toggleStatus ? 'Secret Message' : 'Hidden'}</h1>}
  </StateContext.Consumer>
)

class Container extends React.Component {
  handleToggle = () => {
    this.setState(prevState => ({
      toggleStatus: !prevState.toggleStatus,
    }))
  }

  state = {
    toggleStatus: false,
    handleToggle: this.handleToggle,
  }

  render() {
    return (
      <div>
        <StateContext.Provider value={this.state}>
          <MyButton />
          <SecretMessage />
        </StateContext.Provider>
      </div>
    )
  }
}

test('Component renders with the correct message then correctly changes message after clicking button', () => {
  const {getByText} = render(<Container />)
  expect(getByText('Hidden').textContent).toBe('Hidden')
  Simulate.click(getByText('Push Me'))
  expect(getByText('Secret Message').textContent).toBe('Secret Message')
})
