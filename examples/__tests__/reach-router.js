import React from 'react'
import {render, cleanup} from 'react-testing-library'
import {
  Router,
  Link,
  createHistory,
  createMemorySource,
  LocationProvider,
} from '@reach/router'
import 'jest-dom/extend-expect'

const About = () => <div>You are on the about page</div>
const Home = () => <div>You are home</div>
const NoMatch = () => <div>No match</div>

function App() {
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Router>
        <Home path="/" />
        <About path="/about" />
        <NoMatch default />
      </Router>
    </div>
  )
}

// Ok, so here's what your tests might look like

afterEach(cleanup)

// this is a handy function that I would utilize for any component
// that relies on the router being in context
function renderWithRouter(
  ui,
  {route = '/', history = createHistory(createMemorySource(route))} = {},
) {
  return {
    ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
    // adding `history` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    history,
  }
}

test('full app rendering/navigating', async () => {
  const {
    container,
    history: {navigate},
  } = renderWithRouter(<App />)
  const appContainer = container
  // normally I'd use a data-testid, but just wanted to show this is also possible
  expect(appContainer.innerHTML).toMatch('You are home')

  // with reach-router we don't need to simulate a click event, we can just transition
  // to the page using the navigate function returned from the history object.
  await navigate('/about')
  expect(container.innerHTML).toMatch('You are on the about page')
})

test('landing on a bad page', () => {
  const {container} = renderWithRouter(<App />, {
    route: '/something-that-does-not-match',
  })
  // normally I'd use a data-testid, but just wanted to show this is also possible
  expect(container.innerHTML).toMatch('No match')
})
