import {Simulate as ReactSimulate} from 'react-dom/test-utils'

interface RenderResult {
  container: HTMLDivElement
  unmount: VoidFunction
  queryByTestId: (id: string) => HTMLElement | null
  getByTestId: (id: string) => HTMLElement
  queryByText: (id: string) => HTMLElement | null
  getByText: (id: string) => HTMLElement
  queryByPlaceholderText: (id: string) => HTMLElement | null
  getByPlaceholderText: (id: string) => HTMLElement
  queryByLabelText: (id: string) => HTMLElement | null
  getByLabelText: (id: string) => HTMLElement
  queryByAltText: (text: string) => HTMLElement | null
  getByAltText: (text: string) => HTMLElement
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
