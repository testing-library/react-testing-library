// TypeScript Version: 3.8

import {
  queries,
  Queries,
  BoundFunction,
  prettyFormat,
} from '@testing-library/dom'
import {Renderer} from 'react-dom'
import {act as reactAct} from 'react-dom/test-utils'

export * from '@testing-library/dom'

export type RenderResult<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
> = {
  container: Container
  baseElement: Element
  debug: (
    baseElement?:
      | Element
      | DocumentFragment
      | Array<Element | DocumentFragment>,
    maxLength?: number,
    options?: prettyFormat.OptionsReceived,
  ) => void
  rerender: (ui: React.ReactElement) => void
  unmount: () => void
  asFragment: () => DocumentFragment
} & {[P in keyof Q]: BoundFunction<Q[P]>}

export interface RenderOptions<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
> {
  /**
   * By default, React Testing Library will create a div and append that div to the document.body. Your React component will be rendered in the created div. If you provide your own HTMLElement container via this option,
   *  it will not be appended to the document.body automatically.
   *
   *  For example: If you are unit testing a `<tbody>` element, it cannot be a child of a div. In this case, you can
   *  specify a table as the render container.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#container
   */
  container?: Container
  /**
   * Defaults to the container if the container is specified. Otherwise `document.body` is used for the default. This is used as
   *  the base element for the queries as well as what is printed when you use `debug()`.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#baseelement
   */
  baseElement?: Element
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate?: boolean
  /**
   * Queries to bind. Overrides the default set from DOM Testing Library unless merged.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#queries
   */
  queries?: Q
  /**
   * Pass a React Component as the wrapper option to have it rendered around the inner element. This is most useful for creating
   *  reusable custom render functions for common data providers. See setup for examples.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#wrapper
   */
  wrapper?: React.JSXElementConstructor<{children: React.ReactElement}>
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
>(
  ui: React.ReactElement,
  options: RenderOptions<Q, Container>,
): RenderResult<Q, Container>
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): void

/**
 * Simply calls ReactDOMTestUtils.act(cb)
 * If that's not available (older version of react) then it
 * simply calls the given callback immediately
 */
export const act: typeof reactAct extends undefined
  ? (callback: () => void) => void
  : typeof reactAct
