// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TitleSpotlight } from './TitleSpotlight';

describe('TitleSpotlight', () => {
  it('renders without error', () => {
    const { container } = render(<TitleSpotlight title="看似花费，实则积累" />);
    expect(container).toBeTruthy();
  });

  it('renders the title text', () => {
    render(<TitleSpotlight title="财务解析" subtitle="2024年度报告" />);
    expect(screen.getByText('财务解析')).toBeTruthy();
    expect(screen.getByText('2024年度报告')).toBeTruthy();
  });
});
