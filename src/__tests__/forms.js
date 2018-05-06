import React from 'react'
import {render, Simulate} from '../'

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
  const {container, getByLabelText, getByText} = render(
    <Login onSubmit={handleSubmit} />,
  )

  const usernameNode = getByLabelText(/username/i)
  const passwordNode = getByLabelText(/password/i)
  const formNode = container.querySelector('form')
  const submitButtonNode = getByText(/submit/i)

  // Act
  usernameNode.value = fakeUser.username
  passwordNode.value = fakeUser.password
  // NOTE: in jsdom, it's not possible to trigger a form submission
  // by clicking on the submit button. This is really unfortunate.
  // So the next best thing is to simulate a submit on the form itself
  // then ensure that there's a submit button.
  Simulate.submit(formNode)

  // Assert
  expect(handleSubmit).toHaveBeenCalledTimes(1)
  expect(handleSubmit).toHaveBeenCalledWith(fakeUser)
  // make sure the form is submittable
  expect(submitButtonNode.type).toBe('submit')
})

/* eslint jsx-a11y/label-has-for:0 */
