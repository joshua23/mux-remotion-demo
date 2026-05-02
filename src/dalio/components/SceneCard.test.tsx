// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SceneCard } from './SceneCard';

describe('SceneCard', () => {
  it('renders without error', () => {
    const { container } = render(<SceneCard title="测试标题" />);
    expect(container).toBeTruthy();
  });

  it('renders the title', () => {
    render(<SceneCard title="财务总览" />);
    expect(screen.getByText('财务总览')).toBeTruthy();
  });

  it('renders timeRange when provided', () => {
    render(<SceneCard title="测试" timeRange="2024-01 至 2024-12" />);
    expect(screen.getByText('2024-01 至 2024-12')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <SceneCard title="测试">
        <div data-testid="child-content">内容</div>
      </SceneCard>
    );
    expect(screen.getByTestId('child-content')).toBeTruthy();
  });
});
