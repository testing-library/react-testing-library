import React from 'react'
import {CSSTransition} from 'react-transition-group'
import {render, fireEvent, cleanup} from 'react-testing-library'

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
        <button onClick={this.toggle}>Toggle</button>
        <Fade in={this.state.show}>
          <div>Hello world</div>
        </Fade>
      </div>
    )
  }
}

afterEach(cleanup)

jest.mock('react-transition-group', () => {
  const FakeCSSTransition = jest.fn(() => null)
  return {CSSTransition: FakeCSSTransition}
})

test('you can mock things with jest.mock', () => {
  const {getByText} = render(<HiddenMessage initialShow={true} />)
  const context = expect.any(Object)
  const children = expect.any(Object)
  const defaultProps = {children, timeout: 1000, className: 'fade'}
  expect(CSSTransition).toHaveBeenCalledWith(
    {in: true, ...defaultProps},
    context,
  )
  fireEvent.click(getByText(/toggle/i))
  expect(CSSTransition).toHaveBeenCalledWith(
    {in: true, ...defaultProps},
    expect.any(Object),
  )
})
