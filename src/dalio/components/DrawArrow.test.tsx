// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DrawArrow } from './DrawArrow';

describe('DrawArrow', () => {
  it('renders without error', () => {
    const { container } = render(
      <DrawArrow d="M 10 10 L 100 100" endPoint={{ x: 100, y: 100, angle: 45 }} />
    );
    expect(container).toBeTruthy();
  });

  it('renders an arrowhead polygon', () => {
    const { container } = render(
      <DrawArrow d="M 10 10 L 100 100" endPoint={{ x: 100, y: 100, angle: 45 }} />
    );
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeTruthy();
    expect(polygon?.getAttribute('transform')).toContain('100');
  });
});
