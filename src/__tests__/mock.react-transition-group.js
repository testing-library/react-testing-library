import React from 'react'
import {CSSTransition} from 'react-transition-group'
import {render, Simulate} from '../'

function Fade({children, ...props}) {
  return (
    <CSSTransition {...props} timeout={1000} className="fade">
      {children}
    </CSSTransition>
  )
}

class HiddenMessage extends React.Component {
  state = {show: this.props.initialShow || false}
  toggle = () => {
    this.setState(({show}) => ({show: !show}))
  }
  render() {
    return (
      <div>
        <button data-testid="toggle-message" onClick={this.toggle}>
          Toggle
        </button>
        <Fade in={this.state.show}>
          <div data-testid="hidden-message">Hello world</div>
        </Fade>
      </div>
    )
  }
}

jest.mock('react-transition-group', () => {
  const FakeTransition = jest.fn(({children}) => children)
  const FakeCSSTransition = jest.fn(
    props =>
      props.in ? <FakeTransition>{props.children}</FakeTransition> : null,
  )
  return {CSSTransition: FakeCSSTransition, Transition: FakeTransition}
})

test('you can mock things with jest.mock', () => {
  const {getByTestId, queryByTestId} = render(
    <HiddenMessage initialShow={true} />,
  )
  expect(queryByTestId('hidden-message')).toBeTruthy() // we just care it exists
  // hide the message
  Simulate.click(getByTestId('toggle-message'))
  // in the real world, the CSSTransition component would take some time
  // before finishing the animation which would actually hide the message.
  // So we've mocked it out for our tests to make it happen instantly
  expect(queryByTestId('hidden-message')).toBeFalsy() // we just care it doesn't exist
})
