import {getQueriesForElement} from 'dom-testing-library'

export * from 'dom-testing-library'

type GetsAndQueries = ReturnType<typeof getQueriesForElement>

export interface RenderResult extends GetsAndQueries {
  container: HTMLElement
  baseElement: HTMLElement
  debug: (baseElement?: HTMLElement) => void
  rerender: (ui: React.ReactElement<any>) => void
  unmount: () => boolean
}

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render(
  ui: React.ReactElement<any>,
  options?: {container: HTMLElement; baseElement: HTMLElement},
): RenderResult

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): void
