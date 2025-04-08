import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with basic progress', () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByRole('generic').querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('normalizes progress values above 100', () => {
    render(<ProgressBar progress={150} />);
    const progressBar = screen.getByRole('generic').querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('normalizes progress values below 0', () => {
    render(<ProgressBar progress={-20} />);
    const progressBar = screen.getByRole('generic').querySelector('.bg-primary');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('renders with label', () => {
    const label = 'Loading Progress';
    render(<ProgressBar progress={75} label={label} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows percentage by default', () => {
    render(<ProgressBar progress={60} label="Progress" />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressBar progress={60} label="Progress" showPercentage={false} />);
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'my-custom-class';
    render(<ProgressBar progress={50} className={customClass} />);
    expect(screen.getByRole('generic')).toHaveClass(customClass);
  });

  it('renders without label section when no label provided', () => {
    render(<ProgressBar progress={50} />);
    const labelContainer = screen.queryByText(/Progress/i);
    expect(labelContainer).not.toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    render(<ProgressBar progress={50} />);
    const container = screen.getByRole('generic');
    const background = container.querySelector('.bg-gray-200');
    const progressBar = container.querySelector('.bg-primary');

    expect(background).toHaveClass('rounded-full', 'h-2.5');
    expect(progressBar).toHaveClass('rounded-full', 'h-2.5', 'transition-all', 'duration-300', 'ease-in-out');
  });
});