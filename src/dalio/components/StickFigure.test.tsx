// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StickFigure } from './StickFigure';

describe('StickFigure', () => {
  it('renders without error', () => {
    const { container } = render(<StickFigure />);
    expect(container).toBeTruthy();
  });

  it('renders an SVG path', () => {
    const { container } = render(<StickFigure pose="standing" />);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('stroke')).toBeTruthy();
  });
});
