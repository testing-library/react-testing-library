import React from 'react'
import cases from 'jest-in-case'
import {render} from '../'

cases(
  'text matchers',
  opts => {
    const {getByText} = render(
      <a href="/about" id="anchor">
        About
      </a>,
    )
    expect(getByText(opts.textMatch).id).toBe('anchor')
  },
  [
    {name: 'string match', textMatch: 'About'},
    {name: 'case insensitive', textMatch: 'about'},
    {name: 'regex', textMatch: /^about$/i},
    {
      name: 'function',
      textMatch: (text, element) =>
        element.tagName === 'A' && text.includes('out'),
    },
  ],
)
