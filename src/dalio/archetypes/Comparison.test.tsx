// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Comparison } from './Comparison';

const CARD = { index: 2, title: '对比分析', body: '支出与收益', narration: '旁白', rawHtml: '' };

describe('Comparison', () => {
  it('renders without error', () => {
    const { container } = render(<Comparison card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders both bar labels', () => {
    const { container } = render(<Comparison card={CARD} leftLabel="总支出" rightLabel="被动收益" />);
    expect(container.textContent).toContain('总支出');
    expect(container.textContent).toContain('被动收益');
  });
});
