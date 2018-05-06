import React from 'react'
import {withRouter} from 'react-router'
import {Link, Route, Router, Switch} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import {render, Simulate} from 'react-testing-library'

const About = () => <div>You are on the about page</div>
const Home = () => <div>You are home</div>
const NoMatch = () => <div>No match</div>

const LocationDisplay = withRouter(({location}) => (
  <div data-testid="location-display">{location.pathname}</div>
))

function App() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route component={NoMatch} />
      </Switch>
      <LocationDisplay />
    </div>
  )
}

// Ok, so here's what your tests might look like

// this is a handy function that I would utilize for any component
// that relies on the router being in context
function renderWithRouter(
  ui,
  {route = '/', history = createMemoryHistory({initialEntries: [route]})} = {},
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  }
}

test('full app rendering/navigating', () => {
  const {container, getByText} = renderWithRouter(<App />)
  // normally I'd use a data-testid, but just wanted to show this is also possible
  expect(container.innerHTML).toMatch('You are home')
  const leftClick = {button: 0}
  Simulate.click(getByText(/about/i), leftClick)
  // normally I'd use a data-testid, but just wanted to show this is also possible
  expect(container.innerHTML).toMatch('You are on the about page')
})

test('landing on a bad page', () => {
  const {container} = renderWithRouter(<App />, {
    route: '/something-that-does-not-match',
  })
  // normally I'd use a data-testid, but just wanted to show this is also possible
  expect(container.innerHTML).toMatch('No match')
})

test('rendering a component that uses withRouter', () => {
  const route = '/some-route'
  const {getByTestId} = renderWithRouter(<LocationDisplay />, {route})
  expect(getByTestId('location-display').textContent).toBe(route)
})
