import {Simulate as ReactSimulate} from 'react-dom/test-utils'

interface RenderResult {
  container: HTMLDivElement
  unmount: VoidFunction
  queryByTestId: (id: string) => HTMLElement | null
}

export function render(
  ui: React.ReactElement<any>,
  options?: {container: HTMLElement},
): RenderResult

export function flushPromises(): Promise<void>

export const Simulate: typeof ReactSimulate
