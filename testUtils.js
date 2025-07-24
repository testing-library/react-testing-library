// testUtils.js
// Utility functions for testing React components with React Testing Library

import { render } from '@testing-library/react';

const customRender = (ui, options) =>
  render(ui, {
    ...options,
  });

export * from '@testing-library/react';
export { customRender as render };
