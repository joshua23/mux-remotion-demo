// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MacroMicroZoom } from './MacroMicroZoom';

const CARD = { index: 6, title: '宏观到微观', body: '从全景推进', narration: '旁白', rawHtml: '' };

describe('MacroMicroZoom', () => {
  it('renders without error', () => {
    const { container } = render(<MacroMicroZoom card={CARD} />);
    expect(container).toBeTruthy();
  });

  it('renders the card title', () => {
    const { container } = render(<MacroMicroZoom card={CARD} />);
    expect(container.textContent).toContain('宏观到微观');
  });
});
