import { useCallback, useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'dark' | 'light';
type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'theme-preference';
const CYCLE_ORDER: ThemePreference[] = ['system', 'dark', 'light'];

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'system' || stored === 'dark' || stored === 'light') return stored;
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolve(pref: ThemePreference): ResolvedTheme {
  return pref === 'system' ? getSystemTheme() : pref;
}

function applyThemeClass(theme: ResolvedTheme): void {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

/** Shared mutable state so all hook instances stay in sync. */
let currentPreference: ThemePreference = 'system';
let currentResolved: ResolvedTheme = 'dark';
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string {
  return `${currentPreference}:${currentResolved}`;
}

function init(): void {
  currentPreference = getStoredPreference();
  currentResolved = resolve(currentPreference);

  // Suppress transition flash on initial load
  document.documentElement.classList.add('no-transitions');
  applyThemeClass(currentResolved);
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transitions');
  });

  // Listen for OS preference changes
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', () => {
    if (currentPreference !== 'system') return;
    currentResolved = getSystemTheme();
    applyThemeClass(currentResolved);
    emitChange();
  });
}

let initialised = false;

function ensureInit(): void {
  if (initialised) return;
  initialised = true;
  init();
}

export function useTheme(): {
  resolvedTheme: ResolvedTheme;
  preference: ThemePreference;
  cycleTheme: () => void;
} {
  ensureInit();

  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const [preference, resolvedTheme] = snapshot.split(':') as [ThemePreference, ResolvedTheme];

  const cycleTheme = useCallback(() => {
    const idx = CYCLE_ORDER.indexOf(currentPreference);
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
    currentPreference = next;
    currentResolved = resolve(next);
    localStorage.setItem(STORAGE_KEY, next);

    const apply = () => applyThemeClass(currentResolved);
    if (document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }

    emitChange();
  }, []);

  return { resolvedTheme, preference, cycleTheme };
}
