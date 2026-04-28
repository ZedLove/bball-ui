import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../hooks/useTheme';

const icons: Record<ThemePreference, { svg: string; label: string; next: string }> = {
  system: {
    svg: 'M4 5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm1.5 5.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5Z',
    label: 'Theme: auto. Tap to switch to dark.',
    next: 'dark',
  },
  dark: {
    svg: 'M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792 0 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278Z',
    label: 'Theme: dark. Tap to switch to light.',
    next: 'light',
  },
  light: {
    svg: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0Zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13Zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5ZM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8Zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0Zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0Zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707ZM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708Z',
    label: 'Theme: light. Tap to switch to auto.',
    next: 'auto',
  },
};

export function ThemeToggle() {
  const { preference, cycleTheme } = useTheme();
  const { svg, label } = icons[preference];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={label}
      className="rounded-md p-1.5 text-fg-muted hover:text-fg transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d={svg} />
      </svg>
    </button>
  );
}
