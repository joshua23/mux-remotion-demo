// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hierarchy } from './Hierarchy';

const CARD = { index: 5, title: '支出层级', body: '分类分布', narration: '旁白', rawHtml: '' };

describe('Hierarchy', () => {
  it('renders without error', () => {
    const { container } = render(<Hierarchy card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders root label', () => {
    const { container } = render(<Hierarchy card={CARD} rootLabel="总支出" />);
    expect(container.textContent).toContain('总支出');
  });
});
