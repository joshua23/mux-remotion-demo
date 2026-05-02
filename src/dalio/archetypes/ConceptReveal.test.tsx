// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConceptReveal } from './ConceptReveal';

const CARD = { index: 0, title: '概念揭示', body: '这是正文内容', narration: '旁白文案', rawHtml: '' };

describe('ConceptReveal', () => {
  it('renders without error', () => {
    const { container } = render(<ConceptReveal card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders the card title', () => {
    const { container } = render(<ConceptReveal card={CARD} />);
    expect(container.textContent).toContain('概念揭示');
  });
});
