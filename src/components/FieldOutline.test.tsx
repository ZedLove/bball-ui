import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FieldOutline } from './FieldOutline';
import type { VenueFieldInfo } from '../game-update';

const venueInfo: VenueFieldInfo = {
  venueId: 3289,
  leftLine: 335,
  leftCenter: 358,
  center: 408,
  rightCenter: 375,
  rightLine: 330,
};

describe('FieldOutline', () => {
  it('renders a fence outline path', () => {
    render(<FieldOutline venueFieldInfo={venueInfo} />);
    expect(screen.getByTestId('fence-outline')).toBeInTheDocument();
  });

  it('renders foul lines', () => {
    render(<FieldOutline venueFieldInfo={venueInfo} />);
    expect(screen.getByTestId('foul-line-left')).toBeInTheDocument();
    expect(screen.getByTestId('foul-line-right')).toBeInTheDocument();
  });

  it('renders the infield diamond', () => {
    render(<FieldOutline venueFieldInfo={venueInfo} />);
    expect(screen.getByTestId('infield-diamond')).toBeInTheDocument();
  });

  it('uses solid stroke for venue-accurate outline', () => {
    render(<FieldOutline venueFieldInfo={venueInfo} />);
    expect(screen.getByTestId('fence-outline')).not.toHaveAttribute('stroke-dasharray');
  });

  it('renders generic fallback when venueFieldInfo is null', () => {
    render(<FieldOutline venueFieldInfo={null} />);
    expect(screen.getByTestId('fence-outline')).toBeInTheDocument();
  });

  it('uses dashed stroke for generic fallback', () => {
    render(<FieldOutline venueFieldInfo={null} />);
    expect(screen.getByTestId('fence-outline')).toHaveAttribute('stroke-dasharray');
  });

  it('has accessible role and label when not aria-hidden', () => {
    render(<FieldOutline venueFieldInfo={null} />);
    expect(screen.getByRole('img', { name: 'Baseball field outline' })).toBeInTheDocument();
  });

  it('suppresses accessible role when ariaHidden is true', () => {
    render(<FieldOutline venueFieldInfo={null} ariaHidden />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
