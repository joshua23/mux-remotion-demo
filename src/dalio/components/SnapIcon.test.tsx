// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SnapIcon } from './SnapIcon';

describe('SnapIcon', () => {
  it('renders without error', () => {
    const { container } = render(<SnapIcon><span>★</span></SnapIcon>);
    expect(container).toBeTruthy();
  });

  it('renders children', () => {
    const { container } = render(<SnapIcon><span data-testid="icon-child">★</span></SnapIcon>);
    expect(container.querySelector('[data-testid="icon-child"]')).toBeTruthy();
  });
});
