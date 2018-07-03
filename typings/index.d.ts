import {Simulate as ReactSimulate} from 'react-dom/test-utils'
import {getQueriesForElement} from 'dom-testing-library'

export * from 'dom-testing-library'

type GetsAndQueries = ReturnType<typeof getQueriesForElement>

export interface RenderResult extends GetsAndQueries {
  container: HTMLDivElement
  debug: () => void
  rerender: (ui: React.ReactElement<any>) => void
  unmount: VoidFunction
}

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render(
  ui: React.ReactElement<any>,
  options?: {container: HTMLElement; baseElement: HTMLElement},
): RenderResult

/**
 * When in need to wait for DOM elements to appear, disappear, or change. Prefer waitForElement.
 */
export function wait(
  callback?: () => void,
  options?: {
    timeout?: number
    interval?: number
  },
): Promise<void>

/**
 * When in need to wait for DOM elements to appear, disappear, or change.
 */
export function waitForElement<T>(
  callback?: () => T,
  options?: {
    container?: HTMLElement
    timeout?: number
    mutationObserverOptions?: MutationObserverInit
  },
): Promise<T | undefined>

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): void
