import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameTimers } from './useGameTimers';
import { useGameStore } from '../store/gameStore';
import { makeUpdate } from '../test/fixtures';

describe('useGameTimers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({ update: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not clear update before 5 minutes after final', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'final' }) });
    renderHook(() => useGameTimers());

    act(() => {
      vi.advanceTimersByTime(4 * 60 * 1_000);
    });
    expect(useGameStore.getState().update).not.toBeNull();
  });

  it('clears update after 5 minutes when trackingMode is final', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'final' }) });
    renderHook(() => useGameTimers());

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1_000 + 1);
    });
    expect(useGameStore.getState().update).toBeNull();
  });

  it('does not start game-over timer for non-final modes', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'outs' }) });
    renderHook(() => useGameTimers());

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1_000 + 1);
    });
    // Only the 30-min safety net would clear it; 5 min is not enough
    expect(useGameStore.getState().update).not.toBeNull();
  });

  it('clears update after 30-minute inactivity safety net', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'outs' }) });
    renderHook(() => useGameTimers());

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1_000 + 1);
    });
    expect(useGameStore.getState().update).toBeNull();
  });

  it('resets the 30-min timer when a new update arrives', () => {
    useGameStore.setState({ update: makeUpdate({ trackingMode: 'outs' }) });
    const { rerender } = renderHook(() => useGameTimers());

    // 25 minutes elapse — then a new update arrives
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1_000);
    });
    act(() => {
      useGameStore.setState({ update: makeUpdate({ trackingMode: 'outs', outs: 2 }) });
    });
    rerender();

    // Another 25 minutes elapse (50 total from first update, 25 since last)
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1_000);
    });
    expect(useGameStore.getState().update).not.toBeNull(); // reset worked

    // Timer fires 30 min after the second update
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1_000 + 1);
    });
    expect(useGameStore.getState().update).toBeNull();
  });

  it('does not start inactivity timer when update is null', () => {
    renderHook(() => useGameTimers());

    act(() => {
      vi.advanceTimersByTime(30 * 60 * 1_000 + 1);
    });
    // Was already null — nothing to clear
    expect(useGameStore.getState().update).toBeNull();
  });
});
