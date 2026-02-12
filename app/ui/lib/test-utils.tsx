import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

// Create a custom render function that can include providers if needed
export function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { ...options });
}

export * from '@testing-library/react';
export { customRender as render };
