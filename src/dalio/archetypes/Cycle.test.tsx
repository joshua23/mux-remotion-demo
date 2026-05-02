// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Cycle } from './Cycle';

const CARD = { index: 3, title: '资金循环', body: '循环引擎', narration: '旁白', rawHtml: '' };

describe('Cycle', () => {
  it('renders without error', () => {
    const { container } = render(<Cycle card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders all cycle nodes', () => {
    const { container } = render(<Cycle card={CARD} nodes={['收入', '消费', '储蓄', '投资']} />);
    expect(container.textContent).toContain('收入');
    expect(container.textContent).toContain('储蓄');
  });
});
