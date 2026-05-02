// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CameraPan } from './CameraPan';

describe('CameraPan', () => {
  it('renders without error', () => {
    const { container } = render(
      <CameraPan from={{ x: 0, y: 0, scale: 1 }} to={{ x: 100, y: 0, scale: 1.5 }}>
        <div>content</div>
      </CameraPan>
    );
    expect(container).toBeTruthy();
  });

  it('renders children', () => {
    const { container } = render(
      <CameraPan from={{ x: 0, y: 0, scale: 1 }} to={{ x: 0, y: 0, scale: 1 }}>
        <div data-testid="pan-child">content</div>
      </CameraPan>
    );
    expect(container.querySelector('[data-testid="pan-child"]')).toBeTruthy();
  });
});
