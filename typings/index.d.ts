import {getQueriesForElement} from 'dom-testing-library'

export * from 'dom-testing-library'

type GetsAndQueries = ReturnType<typeof getQueriesForElement>

export interface RenderResult extends GetsAndQueries {
  container: HTMLElement
  baseElement: HTMLElement
  debug: (baseElement?: HTMLElement | DocumentFragment) => void
  rerender: (ui: React.ReactElement<any>) => void
  unmount: () => boolean
  asFragment: () => DocumentFragment
}

export interface RenderOptions {
  container: HTMLElement
  baseElement?: HTMLElement
  hydrate?: boolean
}

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render(
  ui: React.ReactElement<any>,
  options?: RenderOptions,
): RenderResult

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): void

/**
 * Forces React's `useEffect` hook to run synchronously.
 */
export function flushEffects(): void
