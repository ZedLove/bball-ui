import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BatterSilhouette } from './BatterSilhouette';

describe('BatterSilhouette', () => {
  it('renders a g element', () => {
    const { container } = render(
      <svg>
        <BatterSilhouette side="R" height={80} />
      </svg>
    );
    const groups = container.querySelectorAll('g');
    expect(groups.length).toBeGreaterThanOrEqual(1);
  });

  it('applies a negative x-scale transform for left-handed batters', () => {
    const { container } = render(
      <svg>
        <BatterSilhouette side="L" height={80} />
      </svg>
    );
    const outerG = container.querySelector('g');
    expect(outerG?.getAttribute('transform')).toContain('scale(-1, 1)');
  });

  it('does not apply a negative x-scale for right-handed batters', () => {
    const { container } = render(
      <svg>
        <BatterSilhouette side="R" height={80} />
      </svg>
    );
    const outerG = container.querySelector('g');
    const transform = outerG?.getAttribute('transform') ?? '';
    expect(transform).not.toContain('scale(-1, 1)');
  });

  it('uses the provided fill colour', () => {
    const { container } = render(
      <svg>
        <BatterSilhouette side="R" height={80} fill="#ff0000" />
      </svg>
    );
    const innerG = container.querySelector('g > g');
    expect(innerG?.getAttribute('fill')).toBe('#ff0000');
  });

  it('defaults fill to var(--color-fg-faint)', () => {
    const { container } = render(
      <svg>
        <BatterSilhouette side="R" height={80} />
      </svg>
    );
    const innerG = container.querySelector('g > g');
    expect(innerG?.getAttribute('fill')).toBe('var(--color-fg-faint)');
  });
});
