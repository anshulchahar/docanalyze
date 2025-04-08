import { render, screen, act } from '@testing-library/react';
import ErrorMessage from '@/components/ErrorMessage';

// Mock heroicons
jest.mock('@heroicons/react/20/solid', () => ({
  ExclamationCircleIcon: () => <svg data-testid="exclamation-icon" />
}));

describe('ErrorMessage', () => {
  it('renders with message', () => {
    const message = 'Test error message';
    render(<ErrorMessage message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    render(<ErrorMessage message="" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const message = 'Test error message';
    const customClass = 'my-custom-class';
    render(<ErrorMessage message={message} className={customClass} />);
    expect(screen.getByRole('alert')).toHaveClass(customClass);
  });

  it('renders with icon by default', () => {
    render(<ErrorMessage message="Test message" />);
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-5', 'w-5');
  });

  it('hides icon when icon prop is false', () => {
    render(<ErrorMessage message="Test message" icon={false} />);
    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('renders with custom id', () => {
    const id = 'custom-error-id';
    render(<ErrorMessage message="Test message" id={id} />);
    expect(screen.getByRole('alert')).toHaveAttribute('id', id);
  });

  it('applies animation classes when animated is true', () => {
    render(<ErrorMessage message="Test message" animated={true} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });

  it('does not apply animation classes when animated is false', () => {
    render(<ErrorMessage message="Test message" animated={false} />);
    const alert = screen.getByRole('alert');
    expect(alert).not.toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });

  it('handles visibility state changes', async () => {
    const { rerender } = render(<ErrorMessage message="Test message" animated={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('opacity-100', 'transform', 'translate-y-0');

    // Test unmounting behavior
    rerender(<ErrorMessage message="" animated={true} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});