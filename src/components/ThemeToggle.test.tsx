import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function stubMatchMedia(prefersDark: boolean) {
  const mql = {
    matches: prefersDark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'no-transitions');
    vi.resetModules();
    stubMatchMedia(true);
  });

  async function loadAndRender() {
    const { ThemeToggle } = await import('./ThemeToggle');
    return render(<ThemeToggle />);
  }

  it('renders with system icon by default', async () => {
    await loadAndRender();
    expect(
      screen.getByRole('button', { name: /Theme: auto\. Tap to switch to dark\./i })
    ).toBeInTheDocument();
  });

  it('cycles to dark on click', async () => {
    const user = userEvent.setup();
    await loadAndRender();
    const btn = screen.getByRole('button');
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-label', 'Theme: dark. Tap to switch to light.');
  });

  it('cycles through all three states', async () => {
    const user = userEvent.setup();
    await loadAndRender();
    const btn = screen.getByRole('button');

    await user.click(btn); // system → dark
    expect(btn).toHaveAttribute('aria-label', 'Theme: dark. Tap to switch to light.');

    await user.click(btn); // dark → light
    expect(btn).toHaveAttribute('aria-label', 'Theme: light. Tap to switch to auto.');

    await user.click(btn); // light → system
    expect(btn).toHaveAttribute('aria-label', 'Theme: auto. Tap to switch to dark.');
  });

  it('has an accessible label', async () => {
    await loadAndRender();
    const btn = screen.getByRole('button');
    expect(btn).toHaveAccessibleName();
  });
});
