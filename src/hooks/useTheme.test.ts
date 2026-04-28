import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * The hook module holds singleton state and initialises once.
 * We need to reset that state between tests by re-importing the module.
 */

// Stub matchMedia before each test
function stubMatchMedia(prefersDark: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mql = {
    matches: prefersDark,
    addEventListener: (_event: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb);
    },
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    fireChange(dark: boolean) {
      mql.matches = dark;
      for (const cb of listeners) cb({ matches: dark });
    },
  };
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'no-transitions');
    // Reset module singleton state by re-importing
    vi.resetModules();
    stubMatchMedia(true); // default: system prefers dark
  });

  async function loadHook() {
    const mod = await import('./useTheme');
    return renderHook(() => mod.useTheme());
  }

  it("defaults to 'system' when localStorage is empty", async () => {
    const { result } = await loadHook();
    expect(result.current.preference).toBe('system');
  });

  it('reads stored preference from localStorage', async () => {
    localStorage.setItem('theme-preference', 'light');
    stubMatchMedia(true);
    const { result } = await loadHook();
    expect(result.current.preference).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
  });

  it('cycleTheme rotates system → dark → light → system', async () => {
    const { result } = await loadHook();
    expect(result.current.preference).toBe('system');

    act(() => result.current.cycleTheme());
    expect(result.current.preference).toBe('dark');

    act(() => result.current.cycleTheme());
    expect(result.current.preference).toBe('light');

    act(() => result.current.cycleTheme());
    expect(result.current.preference).toBe('system');
  });

  it('persists preference to localStorage on cycle', async () => {
    const { result } = await loadHook();
    act(() => result.current.cycleTheme());
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('applies .light class when resolved theme is light', async () => {
    localStorage.setItem('theme-preference', 'light');
    await loadHook();
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('removes .light class when resolved theme is dark', async () => {
    localStorage.setItem('theme-preference', 'dark');
    await loadHook();
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('responds to matchMedia changes when preference is system', async () => {
    const media = stubMatchMedia(true); // starts dark
    const { result } = await loadHook();
    expect(result.current.resolvedTheme).toBe('dark');

    act(() => media.fireChange(false)); // switch to light
    expect(result.current.resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
