import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-8 h-8', 'text-blue-600');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12 h-12');
  });

  it('renders with custom color', () => {
    render(<LoadingSpinner color="secondary" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-gray-600');
  });

  it('renders with text', () => {
    const text = 'Loading data...';
    render(<LoadingSpinner text={text} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('renders with message', () => {
    const message = 'Please wait...';
    render(<LoadingSpinner message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders in fullScreen mode', () => {
    render(<LoadingSpinner fullScreen />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('fixed', 'inset-0', 'bg-white', 'dark:bg-gray-900', 'z-50');
  });

  it('applies custom className', () => {
    const customClass = 'my-custom-class';
    render(<LoadingSpinner className={customClass} />);
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass(customClass);
  });

  it('prefers text over message when both are provided', () => {
    const text = 'Primary text';
    const message = 'Secondary message';
    render(<LoadingSpinner text={text} message={message} />);
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });
});