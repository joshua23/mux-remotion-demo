// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ConceptHighlight } from './ConceptHighlight';

describe('ConceptHighlight', () => {
  it('renders without error', () => {
    const { container } = render(<ConceptHighlight cx={100} cy={100} r={40} />);
    expect(container).toBeTruthy();
  });

  it('renders an SVG path with the arc d attribute', () => {
    const { container } = render(<ConceptHighlight cx={100} cy={100} r={40} />);
    const path = container.querySelector('path');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toContain('A');
  });
});
