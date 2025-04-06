import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptInputBar from '@/components/PromptInputBar';

// Mock ErrorMessage component
jest.mock('@/components/ErrorMessage', () => ({
  __esModule: true,
  default: ({ message, className }: { message: string; className: string }) => (
    message ? <div data-testid="error-message" className={className}>{message}</div> : null
  ),
}));

describe('PromptInputBar', () => {
  const defaultProps = {
    customPrompt: '',
    onCustomPromptChange: jest.fn(),
    onAnalyze: jest.fn(),
    canAnalyze: true,
    isAnalyzing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders prompt input bar', () => {
    render(<PromptInputBar {...defaultProps} />);
    
    // Check that the textarea is rendered
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    // Check that the send button is rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('calls onCustomPromptChange when text is entered', async () => {
    const onCustomPromptChange = jest.fn();
    render(<PromptInputBar {...defaultProps} onCustomPromptChange={onCustomPromptChange} />);
    
    const textarea = screen.getByRole('textbox');
    await userEvent.type(textarea, 'Test prompt');
    
    // onChange should be called for each character typed
    expect(onCustomPromptChange).toHaveBeenCalledTimes(11); // "Test prompt" is 11 characters
    expect(onCustomPromptChange).toHaveBeenLastCalledWith('Test prompt');
  });

  test('calls onAnalyze when Enter key is pressed', async () => {
    const onAnalyze = jest.fn();
    render(<PromptInputBar {...defaultProps} onAnalyze={onAnalyze} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    // onAnalyze should be called once
    expect(onAnalyze).toHaveBeenCalledTimes(1);
  });

  test('does not call onAnalyze when Shift+Enter is pressed (new line)', async () => {
    const onAnalyze = jest.fn();
    render(<PromptInputBar {...defaultProps} onAnalyze={onAnalyze} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    // onAnalyze should not be called
    expect(onAnalyze).not.toHaveBeenCalled();
  });

  test('shows error when trying to analyze without a document', async () => {
    render(<PromptInputBar {...defaultProps} canAnalyze={false} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    // Error message should be displayed
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message').textContent).toContain('Please upload a document');
  });

  test('does not allow analysis when already analyzing', async () => {
    const onAnalyze = jest.fn();
    render(<PromptInputBar {...defaultProps} isAnalyzing={true} onAnalyze={onAnalyze} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    // onAnalyze should not be called
    expect(onAnalyze).not.toHaveBeenCalled();
  });

  test('disables textarea when analyzing', () => {
    render(<PromptInputBar {...defaultProps} isAnalyzing={true} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  test('displays helper text when provided', () => {
    const helperText = 'Custom helper text';
    render(<PromptInputBar {...defaultProps} helperText={helperText} />);
    
    expect(screen.getByText(helperText)).toBeInTheDocument();
  });

  test('displays error message when provided via props', () => {
    const errorMessage = 'Error from props';
    render(<PromptInputBar {...defaultProps} errorMessage={errorMessage} />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message').textContent).toBe(errorMessage);
  });

  test('calls onAnalyze when button is clicked', async () => {
    const onAnalyze = jest.fn();
    render(<PromptInputBar {...defaultProps} onAnalyze={onAnalyze} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    // onAnalyze should be called once
    expect(onAnalyze).toHaveBeenCalledTimes(1);
  });
});