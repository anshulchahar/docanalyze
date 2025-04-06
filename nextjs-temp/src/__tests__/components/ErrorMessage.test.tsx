import { render, screen } from '@testing-library/react';
import ErrorMessage from '@/components/ErrorMessage';
import { act } from 'react-dom/test-utils';

// Mock heroicons
jest.mock('@heroicons/react/20/solid', () => ({
  ExclamationCircleIcon: () => <svg data-testid="exclamation-icon" />
}));

describe('ErrorMessage', () => {
  test('renders nothing when message is empty', () => {
    render(<ErrorMessage message="" />);
    expect(document.body.textContent).toBe('');
  });

  test('renders message when provided', () => {
    const testMessage = 'This is an error message';
    render(<ErrorMessage message={testMessage} />);
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('renders with icon by default', () => {
    render(<ErrorMessage message="Test message" />);
    expect(screen.getByTestId('exclamation-icon')).toBeInTheDocument();
  });

  test('hides icon when icon prop is false', () => {
    render(<ErrorMessage message="Test message" icon={false} />);
    expect(screen.queryByTestId('exclamation-icon')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const customClass = 'custom-class';
    render(<ErrorMessage message="Test message" className={customClass} />);
    expect(screen.getByRole('alert')).toHaveClass(customClass);
  });

  test('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Test message" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('sets custom id when provided', () => {
    const customId = 'error-123';
    render(<ErrorMessage message="Test message" id={customId} />);
    expect(screen.getByRole('alert')).toHaveAttribute('id', customId);
  });

  test('animation state changes when message appears', () => {
    jest.useFakeTimers();
    
    // Initial render with no message
    const { rerender } = render(<ErrorMessage message="" animated={true} />);
    
    // Update with a message
    rerender(<ErrorMessage message="New error" animated={true} />);
    
    // After useEffect runs
    act(() => {
      jest.runAllTimers();
    });
    
    // Should have visible classes
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('opacity-100');
    expect(alert).not.toHaveClass('opacity-0');
    
    jest.useRealTimers();
  });

  test('no animation when animated prop is false', () => {
    render(<ErrorMessage message="Test message" animated={false} />);
    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveClass('transition-all');
  });
});