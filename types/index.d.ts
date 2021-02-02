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
  Container extends Element | DocumentFragment = HTMLElement
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
  Container extends Element | DocumentFragment = HTMLElement
> {
  container?: Container
  baseElement?: Element
  hydrate?: boolean
  queries?: Q
  wrapper?: React.ComponentType
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
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
