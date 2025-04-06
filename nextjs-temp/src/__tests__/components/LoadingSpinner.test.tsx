import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check that the spinner is rendered
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    
    // Should have default size and color classes
    expect(spinner).toHaveClass('w-8 h-8'); // md size
    expect(spinner).toHaveClass('text-blue-600'); // primary color
  });
  
  test('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-4 h-4');
  });
  
  test('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-12 h-12');
  });
  
  test('renders with secondary color', () => {
    render(<LoadingSpinner color="secondary" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-gray-600');
  });
  
  test('renders with light color', () => {
    render(<LoadingSpinner color="light" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('text-white');
  });
  
  test('displays text when provided', () => {
    const text = 'Loading text';
    render(<LoadingSpinner text={text} />);
    
    expect(screen.getByText(text)).toBeInTheDocument();
  });
  
  test('applies custom class', () => {
    const customClass = 'my-custom-class';
    render(<LoadingSpinner className={customClass} />);
    
    const container = document.querySelector(`.${customClass}`);
    expect(container).toBeInTheDocument();
  });
  
  test('renders in fullScreen mode', () => {
    render(<LoadingSpinner fullScreen={true} />);
    
    // Check that fullScreen classes are applied
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('fixed');
    expect(container).toHaveClass('inset-0');
    expect(container).toHaveClass('z-50');
  });
  
  test('prefers message over text prop when both are provided', () => {
    const text = 'Loading text';
    const message = 'Loading message';
    render(<LoadingSpinner text={text} message={message} />);
    
    // The text content should match the message prop (preferred over text)
    const textElement = screen.getByText(message);
    expect(textElement).toBeInTheDocument();
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
});