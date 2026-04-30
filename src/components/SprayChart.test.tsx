import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SprayChart } from './SprayChart';
import { makeBattedBall, makeVenueFieldInfo } from '../test/fixtures';

// Mock FieldOutline so tests focus on SprayChart logic.
// The real coordinate constants are preserved to keep coordinate math consistent.
vi.mock('./FieldOutline', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./FieldOutline')>();
  return {
    ...actual,
    FieldOutline: (_props: unknown) => <div data-testid="field-outline" />,
  };
});

describe('SprayChart', () => {
  it('renders FieldOutline', () => {
    render(<SprayChart hitData={null} venueFieldInfo={null} />);
    expect(screen.getByTestId('field-outline')).toBeInTheDocument();
  });

  it('renders a dot when hitData has coordinates', () => {
    render(<SprayChart hitData={makeBattedBall()} venueFieldInfo={null} />);
    expect(screen.getByTestId('hit-dot')).toBeInTheDocument();
  });

  it('does not render a dot when hitData is null', () => {
    render(<SprayChart hitData={null} venueFieldInfo={null} />);
    expect(screen.queryByTestId('hit-dot')).not.toBeInTheDocument();
  });

  it('does not render a dot when coordinates are null', () => {
    render(<SprayChart hitData={makeBattedBall({ coordinates: null })} venueFieldInfo={null} />);
    expect(screen.queryByTestId('hit-dot')).not.toBeInTheDocument();
  });

  it('renders with venue field info provided', () => {
    render(<SprayChart hitData={makeBattedBall()} venueFieldInfo={makeVenueFieldInfo()} />);
    expect(screen.getByTestId('field-outline')).toBeInTheDocument();
    expect(screen.getByTestId('hit-dot')).toBeInTheDocument();
  });

  it('has aria-label "Spray chart: ball in play" when hitData is null', () => {
    render(<SprayChart hitData={null} venueFieldInfo={null} />);
    expect(screen.getByRole('img', { name: 'Spray chart: ball in play' })).toBeInTheDocument();
  });

  it('has aria-label with metrics when hitData is provided', () => {
    render(<SprayChart hitData={makeBattedBall()} venueFieldInfo={null} />);
    expect(
      screen.getByRole('img', {
        name: /Spray chart: Line Drive, 105.2 mph exit velocity/i,
      }),
    ).toBeInTheDocument();
  });

  it('has "location unavailable" in aria-label when coordinates are null', () => {
    render(<SprayChart hitData={makeBattedBall({ coordinates: null })} venueFieldInfo={null} />);
    expect(
      screen.getByRole('img', { name: /location unavailable/i }),
    ).toBeInTheDocument();
  });

  it('renders trajectory label text when trajectory is provided', () => {
    render(<SprayChart hitData={makeBattedBall({ trajectory: 'fly_ball' })} venueFieldInfo={null} />);
    expect(screen.getByText('Fly Ball')).toBeInTheDocument();
  });

  it('does not render trajectory label when trajectory is null', () => {
    render(<SprayChart hitData={makeBattedBall({ trajectory: null })} venueFieldInfo={null} />);
    expect(screen.queryByText(/Ball|Drive|Ground|Popup/)).not.toBeInTheDocument();
  });
});
