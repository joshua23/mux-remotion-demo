// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StackBuilder } from './StackBuilder';

describe('StackBuilder', () => {
  it('renders without error', () => {
    const items = ['item1', 'item2', 'item3'].map((t) => <span key={t}>{t}</span>);
    const { container } = render(<StackBuilder items={items} />);
    expect(container).toBeTruthy();
  });

  it('renders all items', () => {
    const items = ['A', 'B', 'C'].map((t) => <span key={t}>{t}</span>);
    const { container } = render(<StackBuilder items={items} />);
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('B');
    expect(container.textContent).toContain('C');
  });
});
