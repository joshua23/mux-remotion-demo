// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CountUp } from './CountUp';

describe('CountUp', () => {
  it('renders without error', () => {
    const { container } = render(<CountUp to={100} />);
    expect(container).toBeTruthy();
  });

  it('applies tabular-nums font variant', () => {
    const { container } = render(<CountUp to={1000} />);
    const span = container.querySelector('span');
    expect(span?.style.fontVariantNumeric).toBe('tabular-nums');
  });
});
