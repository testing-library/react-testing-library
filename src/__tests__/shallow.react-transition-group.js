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
  const FakeCSSTransition = jest.fn(() => null)
  return {CSSTransition: FakeCSSTransition}
})

test('you can mock things with jest.mock', () => {
  const {getByTestId} = render(<HiddenMessage initialShow={true} />)
  const context = expect.any(Object)
  const children = expect.any(Object)
  const defaultProps = {children, timeout: 1000, className: 'fade'}
  expect(CSSTransition).toHaveBeenCalledWith(
    {in: true, ...defaultProps},
    context,
  )
  Simulate.click(getByTestId('toggle-message'))
  expect(CSSTransition).toHaveBeenCalledWith(
    {in: true, ...defaultProps},
    expect.any(Object),
  )
})
