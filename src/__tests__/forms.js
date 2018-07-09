import React from 'react'
import {render, fireEvent, cleanup} from '../'

afterEach(cleanup)

function Login({onSubmit}) {
  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault()
          const {username, password} = e.target.elements
          onSubmit({
            username: username.value,
            password: password.value,
          })
        }}
      >
        <label htmlFor="username-input">Username</label>
        <input id="username-input" placeholder="Username..." name="username" />
        <label id="password-label">Password</label>
        <input
          placeholder="Password..."
          type="password"
          name="password"
          aria-labelledby="password-label"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

test('login form submits', () => {
  const fakeUser = {username: 'jackiechan', password: 'hiya! 🥋'}
  const handleSubmit = jest.fn()
  const {getByLabelText, getByText} = render(<Login onSubmit={handleSubmit} />)

  const usernameNode = getByLabelText(/username/i)
  const passwordNode = getByLabelText(/password/i)
  const submitButtonNode = getByText(/submit/i)

  // Act
  usernameNode.value = fakeUser.username
  passwordNode.value = fakeUser.password
  fireEvent.click(submitButtonNode)

  // Assert
  expect(handleSubmit).toHaveBeenCalledTimes(1)
  expect(handleSubmit).toHaveBeenCalledWith(fakeUser)
})

/* eslint jsx-a11y/label-has-for:0, jsx-a11y/aria-proptypes:0 */
