// TypeScript Version: 3.8
// copy of ./index.d.ts but async
import * as ReactDOMClient from 'react-dom/client'
import {
  queries,
  Queries,
  BoundFunction,
  prettyFormat,
  Config as ConfigDTL,
  EventType,
  FireFunction,
  FireObject,
} from '@testing-library/dom'

export * from '@testing-library/dom'

export interface Config extends ConfigDTL {
  reactStrictMode: boolean
}

export interface ConfigFn {
  (existingConfig: Config): Partial<Config>
}

export function configure(configDelta: ConfigFn | Partial<Config>): void

export function getConfig(): Config

export type RenderResult<
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
> = {
  container: Container
  baseElement: BaseElement
  debug: (
    baseElement?:
      | RendererableContainer
      | HydrateableContainer
      | Array<RendererableContainer | HydrateableContainer>
      | undefined,
    maxLength?: number | undefined,
    options?: prettyFormat.OptionsReceived | undefined,
  ) => void
  rerender: (ui: React.ReactNode) => Promise<void>
  unmount: () => Promise<void>
  asFragment: () => DocumentFragment
} & {[P in keyof Q]: BoundFunction<Q[P]>}

/** @deprecated */
export type BaseRenderOptions<
  Q extends Queries,
  Container extends RendererableContainer | HydrateableContainer,
  BaseElement extends RendererableContainer | HydrateableContainer,
> = RenderOptions<Q, Container, BaseElement>

type RendererableContainer = ReactDOMClient.Container
type HydrateableContainer = Parameters<typeof ReactDOMClient['hydrateRoot']>[0]
/** @deprecated */
export interface ClientRenderOptions<
  Q extends Queries,
  Container extends RendererableContainer,
  BaseElement extends RendererableContainer = Container,
> extends BaseRenderOptions<Q, Container, BaseElement> {
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate?: false | undefined
}
/** @deprecated */
export interface HydrateOptions<
  Q extends Queries,
  Container extends HydrateableContainer,
  BaseElement extends HydrateableContainer = Container,
> extends BaseRenderOptions<Q, Container, BaseElement> {
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate: true
}

export interface RenderOptions<
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
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
  container?: Container | undefined
  /**
   * Defaults to the container if the container is specified. Otherwise `document.body` is used for the default. This is used as
   *  the base element for the queries as well as what is printed when you use `debug()`.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#baseelement
   */
  baseElement?: BaseElement | undefined
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate?: boolean | undefined
  /**
   * Only works if used with React 18.
   * Set to `true` if you want to force synchronous `ReactDOM.render`.
   * Otherwise `render` will default to concurrent React if available.
   */
  legacyRoot?: boolean | undefined
  /**
   * Queries to bind. Overrides the default set from DOM Testing Library unless merged.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#queries
   */
  queries?: Q | undefined
  /**
   * Pass a React Component as the wrapper option to have it rendered around the inner element. This is most useful for creating
   *  reusable custom render functions for common data providers. See setup for examples.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#wrapper
   */
  wrapper?: React.JSXElementConstructor<{children: React.ReactNode}> | undefined
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/**
 * Render into a container which is appended to document.body. It should be used with cleanup.
 */
export function render<
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
>(
  ui: React.ReactNode,
  options: RenderOptions<Q, Container, BaseElement>,
): Promise<RenderResult<Q, Container, BaseElement>>
export function render(
  ui: React.ReactNode,
  options?: Omit<RenderOptions, 'queries'> | undefined,
): Promise<RenderResult>

export interface RenderHookResult<Result, Props> {
  /**
   * Triggers a re-render. The props will be passed to your renderHook callback.
   */
  rerender: (props?: Props) => Promise<void>
  /**
   * This is a stable reference to the latest value returned by your renderHook
   * callback
   */
  result: {
    /**
     * The value returned by your renderHook callback
     */
    current: Result
  }
  /**
   * Unmounts the test component. This is useful for when you need to test
   * any cleanup your useEffects have.
   */
  unmount: () => Promise<void>
}

/** @deprecated */
export type BaseRenderHookOptions<
  Props,
  Q extends Queries,
  Container extends RendererableContainer | HydrateableContainer,
  BaseElement extends Element | DocumentFragment,
> = RenderHookOptions<Props, Q, Container, BaseElement>

/** @deprecated */
export interface ClientRenderHookOptions<
  Props,
  Q extends Queries,
  Container extends Element | DocumentFragment,
  BaseElement extends Element | DocumentFragment = Container,
> extends BaseRenderHookOptions<Props, Q, Container, BaseElement> {
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate?: false | undefined
}

/** @deprecated */
export interface HydrateHookOptions<
  Props,
  Q extends Queries,
  Container extends Element | DocumentFragment,
  BaseElement extends Element | DocumentFragment = Container,
> extends BaseRenderHookOptions<Props, Q, Container, BaseElement> {
  /**
   * If `hydrate` is set to `true`, then it will render with `ReactDOM.hydrate`. This may be useful if you are using server-side
   *  rendering and use ReactDOM.hydrate to mount your components.
   *
   *  @see https://testing-library.com/docs/react-testing-library/api/#hydrate)
   */
  hydrate: true
}

export interface RenderHookOptions<
  Props,
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
> extends BaseRenderOptions<Q, Container, BaseElement> {
  /**
   * The argument passed to the renderHook callback. Can be useful if you plan
   * to use the rerender utility to change the values passed to your hook.
   */
  initialProps?: Props | undefined
}

/**
 * Allows you to render a hook within a test React component without having to
 * create that component yourself.
 */
export function renderHook<
  Result,
  Props,
  Q extends Queries = typeof queries,
  Container extends RendererableContainer | HydrateableContainer = HTMLElement,
  BaseElement extends RendererableContainer | HydrateableContainer = Container,
>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props, Q, Container, BaseElement> | undefined,
): Promise<RenderHookResult<Result, Props>>

/**
 * Unmounts React trees that were mounted with render.
 */
export function cleanup(): Promise<void>

export function act(cb: () => void | Promise<void>): Promise<void>

export type AsyncFireFunction = (
  element: Document | Element | Window | Node,
  event: Event,
) => Promise<boolean>
export type AsyncFireObject = {
  [K in EventType]: (
    element: Document | Element | Window | Node,
    options?: {},
  ) => Promise<boolean>
}

export const fireEvent: AsyncFireFunction & AsyncFireObject
