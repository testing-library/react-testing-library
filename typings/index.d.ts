import {Simulate as ReactSimulate} from 'react-dom/test-utils'

type TextMatchFunction = (content: string, element: HTMLElement) => boolean
type TextMatch = string | RegExp | TextMatchFunction
type ExactTextMatch = string | RegExp | TextMatchFunction

interface RenderResult {
  container: HTMLDivElement
  rerender: (ui: React.ReactElement<any>) => void
  unmount: VoidFunction
  queryByTestId: (id: ExactTextMatch) => HTMLElement | null
  getByTestId: (id: ExactTextMatch) => HTMLElement
  queryByText: (id: TextMatch) => HTMLElement | null
  getByText: (text: TextMatch) => HTMLElement
  queryByPlaceholderText: (id: TextMatch) => HTMLElement | null
  getByPlaceholderText: (text: TextMatch) => HTMLElement
  queryByLabelText: (text: TextMatch) => HTMLElement | null
  getByLabelText: (id: TextMatch, options?: {selector: string}) => HTMLElement
  queryByAltText: (text: TextMatch) => HTMLElement | null
  getByAltText: (text: TextMatch) => HTMLElement
}

export function render(
  ui: React.ReactElement<any>,
  options?: {container: HTMLElement},
): RenderResult

export const Simulate: typeof ReactSimulate

export function wait(
  callback?: () => void,
  options?: {
    timeout?: number
    interval?: number
  },
): Promise<void>

export function waitForElement<T>(
  callback?: () => T,
  options?: {
    container?: HTMLElement
    timeout?: number
    mutationObserverOptions?: MutationObserverInit
  },
): Promise<T | undefined>

type EventType =
  | 'copy'
  | 'cut'
  | 'paste'
  | 'compositionEnd'
  | 'compositionStart'
  | 'compositionUpdate'
  | 'keyDown'
  | 'keyPress'
  | 'keyUp'
  | 'focus'
  | 'blur'
  | 'change'
  | 'input'
  | 'invalid'
  | 'submit'
  | 'click'
  | 'contextMenu'
  | 'dblClick'
  | 'drag'
  | 'dragEnd'
  | 'dragEnter'
  | 'dragExit'
  | 'dragLeave'
  | 'dragOver'
  | 'dragStart'
  | 'drop'
  | 'mouseDown'
  | 'mouseEnter'
  | 'mouseLeave'
  | 'mouseMove'
  | 'mouseOut'
  | 'mouseOver'
  | 'mouseUp'
  | 'select'
  | 'touchCancel'
  | 'touchEnd'
  | 'touchMove'
  | 'touchStart'
  | 'scroll'
  | 'wheel'
  | 'abort'
  | 'canPlay'
  | 'canPlayThrough'
  | 'durationChange'
  | 'emptied'
  | 'encrypted'
  | 'ended'
  | 'loadedData'
  | 'loadedMetadata'
  | 'loadStart'
  | 'pause'
  | 'play'
  | 'playing'
  | 'progress'
  | 'rateChange'
  | 'seeked'
  | 'seeking'
  | 'stalled'
  | 'suspend'
  | 'timeUpdate'
  | 'volumeChange'
  | 'waiting'
  | 'load'
  | 'error'
  | 'animationStart'
  | 'animationEnd'
  | 'animationIteration'
  | 'transitionEnd'
  | 'doubleClick'

type FireFunction = (element: HTMLElement, event: Event) => boolean
type FireObject = {
  [K in EventType]: (element: HTMLElement, options?: {}) => boolean
}

export const fireEvent: FireFunction & FireObject

export function renderIntoDocument(ui: React.ReactElement<any>): RenderResult

export function cleanup(): void
