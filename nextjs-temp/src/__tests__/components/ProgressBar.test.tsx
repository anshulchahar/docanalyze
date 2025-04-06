import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    render(<ProgressBar progress={50} />);
    
    // Check that progress bar element exists
    const progressBarElement = screen.getByRole('progressbar', { hidden: true });
    expect(progressBarElement).toBeInTheDocument();
    expect(progressBarElement).toHaveStyle({ width: '50%' });
    
    // No label should be present
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    
    // Percentage should be shown by default
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<ProgressBar progress={75} label="Test Label" />);
    
    // Check label is displayed
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    // Check percentage is displayed
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    // Check progress bar width
    const progressBarElement = screen.getByRole('progressbar', { hidden: true });
    expect(progressBarElement).toHaveStyle({ width: '75%' });
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressBar progress={30} label="Test Label" showPercentage={false} />);
    
    // Check label is displayed
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    
    // Check percentage is not displayed
    expect(screen.queryByText('30%')).not.toBeInTheDocument();
  });

  it('normalizes progress values below 0', () => {
    render(<ProgressBar progress={-20} />);
    
    // Should show 0% instead of -20%
    expect(screen.getByText('0%')).toBeInTheDocument();
    
    // Check progress bar width is 0%
    const progressBarElement = screen.getByRole('progressbar', { hidden: true });
    expect(progressBarElement).toHaveStyle({ width: '0%' });
  });

  it('normalizes progress values above 100', () => {
    render(<ProgressBar progress={150} />);
    
    // Should show 100% instead of 150%
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    // Check progress bar width is 100%
    const progressBarElement = screen.getByRole('progressbar', { hidden: true });
    expect(progressBarElement).toHaveStyle({ width: '100%' });
  });

  it('applies custom className', () => {
    render(<ProgressBar progress={50} className="custom-class" />);
    
    // Check the container has the custom class
    const container = screen.getByTestId('progress-container');
    expect(container).toHaveClass('custom-class');
  });
});