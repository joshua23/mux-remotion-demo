// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CauseEffect } from './CauseEffect';

const CARD = { index: 1, title: '因果链路', body: '资金流动机制', narration: '旁白', rawHtml: '' };

describe('CauseEffect', () => {
  it('renders without error', () => {
    const { container } = render(<CauseEffect card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders the card title', () => {
    const { container } = render(<CauseEffect card={CARD} />);
    expect(container.textContent).toContain('因果链路');
  });
});
