import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BattedBallOverlay } from './BattedBallOverlay';
import { makeBattedBall } from '../test/fixtures';

describe('BattedBallOverlay', () => {
  it('renders exit velocity when provided', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchSpeed: 105.2 })} />);
    expect(screen.getByText('105.2 mph')).toBeInTheDocument();
  });

  it('renders launch angle when provided', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchAngle: 18 })} />);
    expect(screen.getByText('18°')).toBeInTheDocument();
  });

  it('renders distance when provided', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ totalDistance: 380 })} />);
    expect(screen.getByText('380 ft')).toBeInTheDocument();
  });

  it('renders trajectory label when provided', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ trajectory: 'line_drive' })} />);
    expect(screen.getByText('Line Drive')).toBeInTheDocument();
  });

  it('hides exit velocity when null', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchSpeed: null })} />);
    expect(screen.queryByText(/mph/)).not.toBeInTheDocument();
  });

  it('hides launch angle when null', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchAngle: null })} />);
    expect(screen.queryByText(/°/)).not.toBeInTheDocument();
  });

  it('hides distance when null', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ totalDistance: null })} />);
    expect(screen.queryByText(/ ft/)).not.toBeInTheDocument();
  });

  it('shows "In play" when all metrics are null', () => {
    render(
      <BattedBallOverlay
        hitData={makeBattedBall({
          launchSpeed: null,
          launchAngle: null,
          totalDistance: null,
          trajectory: null,
        })}
      />
    );
    expect(screen.getByText('In play')).toBeInTheDocument();
  });

  it('applies highlight colour for high exit velocity (>= 95 mph)', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchSpeed: 95 })} />);
    expect(screen.getByText('95 mph')).toHaveClass('text-accent-outs');
  });

  it('applies highlight for exit velocity above 95 mph', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchSpeed: 110 })} />);
    expect(screen.getByText('110 mph')).toHaveClass('text-accent-outs');
  });

  it('does not highlight exit velocity below 95 mph', () => {
    render(<BattedBallOverlay hitData={makeBattedBall({ launchSpeed: 85 })} />);
    expect(screen.getByText('85 mph')).not.toHaveClass('text-accent-outs');
  });

  it('does not crash when backend sends undefined for nullable fields', () => {
    // The backend may send undefined instead of null for optional fields.
    // Loose != null guards must handle this without throwing.
    const hitData = makeBattedBall({
      trajectory: undefined as unknown as null,
      launchSpeed: undefined as unknown as null,
      launchAngle: undefined as unknown as null,
      totalDistance: undefined as unknown as null,
    });
    expect(() => render(<BattedBallOverlay hitData={hitData} />)).not.toThrow();
    expect(screen.getByText('In play')).toBeInTheDocument();
  });
});
