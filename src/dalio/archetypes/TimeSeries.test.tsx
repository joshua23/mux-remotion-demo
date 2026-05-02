// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeSeries } from './TimeSeries';

const CARD = { index: 2, title: '月度趋势', body: '数据来源：支付宝账单', narration: '旁白', rawHtml: '' };

describe('TimeSeries', () => {
  it('renders without error', () => {
    const { container } = render(<TimeSeries card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders the card title', () => {
    const { container } = render(<TimeSeries card={CARD} />);
    expect(container.textContent).toContain('月度趋势');
  });
});
