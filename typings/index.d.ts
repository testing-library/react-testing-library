import {Simulate as ReactSimulate} from 'react-dom/test-utils'

type TextMatchFunction = (content: string, element: HTMLElement) => boolean
type TextMatch = string | RegExp | TextMatchFunction

interface RenderResult {
  container: HTMLDivElement
  unmount: VoidFunction
  queryByTestId: (id: TextMatch) => HTMLElement | null
  getByTestId: (id: TextMatch) => HTMLElement
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
