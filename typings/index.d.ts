import {queries, BoundFunction} from 'dom-testing-library'

export * from 'dom-testing-library'

interface Query extends Function {
  (container: HTMLElement, ...args: any[]): HTMLElement[] | HTMLElement | null
}

interface Queries {
  [T: string]: Query
}

export type RenderResult<Q extends Queries = typeof queries> = {
  container: HTMLElement
  baseElement: HTMLElement
  debug: (baseElement?: HTMLElement | DocumentFragment) => void
  rerender: (ui: React.ReactElement<any>) => void
  unmount: () => boolean
  asFragment: () => DocumentFragment
} & {[P in keyof Q]: BoundFunction<Q[P]>}

export interface RenderOptions<Q extends Queries = typeof queries> {
  container?: HTMLElement
  baseElement?: HTMLElement
  hydrate?: boolean
  queries?: Q
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render(
  ui: React.ReactElement<any>,
  options?: Omit<RenderOptions, 'queries'>,
): RenderResult
export function render<Q extends Queries>(
  ui: React.ReactElement<any>,
  options: RenderOptions<Q>,
): RenderResult<Q>

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): void

/**
 * Forces React's `useEffect` hook to run synchronously.
 */
export function flushEffects(): void
