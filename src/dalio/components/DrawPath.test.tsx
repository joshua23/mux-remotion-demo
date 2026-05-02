// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DrawPath } from './DrawPath';

describe('DrawPath', () => {
  it('renders without error', () => {
    const { container } = render(
      <DrawPath d="M 10 10 L 100 100" />
    );
    expect(container).toBeTruthy();
  });

  it('renders an SVG path element with the d attribute', () => {
    const { container } = render(
      <DrawPath d="M 10 10 L 100 100" strokeColor="#2A2520" />
    );
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBe('M 10 10 L 100 100');
    expect(path?.getAttribute('stroke')).toBe('#2A2520');
  });
});
