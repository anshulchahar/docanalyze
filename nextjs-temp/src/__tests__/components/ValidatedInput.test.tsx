import { render, screen, fireEvent, act } from '@testing-library/react';
import ValidatedInput from '@/components/ValidatedInput';

describe('ValidatedInput', () => {
    it('renders with basic props', () => {
        render(<ValidatedInput label="Username" />);
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
        render(<ValidatedInput label="Username" required />);
        const label = screen.getByText('Username');
        expect(label.parentElement).toContainHTML('<span class="text-red-500">*</span>');
    });

    it('renders with hidden label', () => {
        render(<ValidatedInput label="Username" hideLabel />);
        const label = screen.getByText('Username');
        expect(label).toHaveClass('sr-only');
    });

    it('renders with help text', () => {
        const helpText = 'Enter your username';
        render(<ValidatedInput label="Username" helpText={helpText} />);
        expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('renders with error message', () => {
        const error = 'Username is required';
        render(<ValidatedInput label="Username" error={error} />);
        expect(screen.getByText(error)).toBeInTheDocument();
    });

    it('hides error message when showErrorMessage is false', () => {
        const error = 'Username is required';
        render(<ValidatedInput label="Username" error={error} showErrorMessage={false} />);
        expect(screen.queryByText(error)).not.toBeInTheDocument();
    });

    it('applies error styles to input when error is present', () => {
        render(<ValidatedInput label="Username" error="Error message" />);
        const input = screen.getByLabelText('Username');
        expect(input).toHaveClass('border-red-300');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('generates id from label when not provided', () => {
        render(<ValidatedInput label="User Name" />);
        const input = screen.getByLabelText('User Name');
        expect(input).toHaveAttribute('id', 'user-name');
    });

    it('uses provided id when available', () => {
        render(<ValidatedInput label="Username" id="custom-id" />);
        const input = screen.getByLabelText('Username');
        expect(input).toHaveAttribute('id', 'custom-id');
    });

    it('forwards additional props to input element', () => {
        render(
            <ValidatedInput
                label="Username"
                placeholder="Enter username"
                maxLength={20}
                data-testid="username-input"
            />
        );
        const input = screen.getByLabelText('Username');
        expect(input).toHaveAttribute('placeholder', 'Enter username');
        expect(input).toHaveAttribute('maxLength', '20');
        expect(input).toHaveAttribute('data-testid', 'username-input');
    });

    it('handles error animation timing', async () => {
        jest.useFakeTimers();

        const { rerender } = render(<ValidatedInput label="Username" />);
        const input = screen.getByLabelText('Username');

        // Add error to trigger animation
        rerender(<ValidatedInput label="Username" error="Error message" />);
        expect(input).toHaveClass('animate-errorShake');

        // Advance timers to complete animation
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(input).not.toHaveClass('animate-errorShake');

        jest.useRealTimers();
    });

    it('cleans up animation timer on unmount', () => {
        jest.useFakeTimers();

        const { unmount } = render(<ValidatedInput label="Username" error="Error" />);
        unmount();

        // Ensure no timer-related errors occur
        act(() => {
            jest.runAllTimers();
        });

        jest.useRealTimers();
    });
}); 