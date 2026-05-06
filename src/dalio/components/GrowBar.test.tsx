// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GrowBar } from './GrowBar';

describe('GrowBar', () => {
  it('renders without error', () => {
    const { container } = render(<GrowBar valueTo={80} maxValue={100} />);
    expect(container).toBeTruthy();
  });

  it('renders label when provided', () => {
    const { container } = render(<GrowBar valueTo={80} maxValue={100} label="餐饮" />);
    expect(container.textContent).toContain('餐饮');
  });
});
