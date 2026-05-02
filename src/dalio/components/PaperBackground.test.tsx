// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PaperBackground } from './PaperBackground';

describe('PaperBackground', () => {
  it('renders without error', () => {
    const { container } = render(<PaperBackground />);
    expect(container).toBeTruthy();
  });

  it('applies paper background color #F2EBD8', () => {
    const { container } = render(<PaperBackground />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgb(242, 235, 216)');
  });
});
