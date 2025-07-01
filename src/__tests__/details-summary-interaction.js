import * as React from 'react'
import {render, fireEvent} from '..'

/**
 * Test suite for native HTML <details> element with <summary>
 *
 * Demonstrates how to test user interactions (clicking <summary>)
 * and verify <details> open/close behavior.
 */
describe('<details><summary> interaction', () => {
  let handleSummaryClick

  beforeEach(() => {
    handleSummaryClick = jest.fn()
  })

  it('should toggle "open" attribute when <summary> is clicked', () => {
    const {container} = render(
      <>
        <details name="requirements">
          <summary onClick={handleSummaryClick}>
            Graduation Requirements
          </summary>
          <p>
            Requires 40 credits, including a passing grade in health, geography,
            history, economics, and wood shop.
          </p>
        </details>
        <details name="requirements">
          <summary onClick={handleSummaryClick}>System Requirements</summary>
          <p>
            Requires a computer running an operating system. The computer must
            have some memory and ideally some kind of long-term storage. An
            input device as well as some form of output device is recommended.
          </p>
        </details>
        <details name="requirements">
          <summary onClick={handleSummaryClick}>Job Requirements</summary>
          <p>
            Requires knowledge of HTML, CSS, JavaScript, accessibility, web
            performance, privacy, security, and internationalization, as well as
            a dislike of broccoli.
          </p>
        </details>
      </>,
    )

    const summaries = container.querySelectorAll('summary')
    expect(summaries.length).toBe(3)

    summaries.forEach((summary, index) => {
      // Initially, details should NOT be open
      const details = summary.closest('details')
      expect(details).not.toHaveAttribute('open')

      // Click the summary
      fireEvent.click(summary)

      // Expect the click handler to be called
      expect(handleSummaryClick).toHaveBeenCalledTimes(index + 1)

      // Details should now be open
      expect(details).toHaveAttribute('open')
    })
  })
})
