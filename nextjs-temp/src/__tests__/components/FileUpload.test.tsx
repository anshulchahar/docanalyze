import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUpload from '@/components/FileUpload';

// Mock ErrorMessage component
jest.mock('@/components/ErrorMessage', () => {
  return function MockErrorMessage({ message }: { message: string, className?: string }) {
    if (!message) return null;
    return <div data-testid="error-message">{message}</div>;
  };
});

// Mock functions
const mockOnFilesAdded = jest.fn();
const mockOnFileRemoved = jest.fn();

// Helper to create a mock file with specific type
const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(['mock content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component correctly', () => {
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Check if the main elements are rendered
    expect(screen.getByText(/drag & drop files or/i)).toBeInTheDocument();
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF, Markdown, DOCX, or text files/i)).toBeInTheDocument();
  });

  test('shows disabled state when disabled prop is true', () => {
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
        disabled={true}
      />
    );

    expect(screen.getByText(/upload in progress/i)).toBeInTheDocument();
  });

  test('displays uploaded files correctly', () => {
    const files = [
      createMockFile('document.pdf', 'application/pdf', 1024 * 1024),
      createMockFile('notes.md', 'text/markdown', 5000),
    ];

    render(
      <FileUpload
        files={files}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Check if files are displayed
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('notes.md')).toBeInTheDocument();

    // Check if file sizes are displayed correctly
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    expect(screen.getByText('4.9 KB')).toBeInTheDocument();

    // Check if file types are displayed correctly
    expect(screen.getAllByText('PDF')[0]).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
  });

  test('handles file removal correctly', async () => {
    const user = userEvent.setup();
    const files = [createMockFile('document.pdf', 'application/pdf', 1024 * 1024)];

    render(
      <FileUpload
        files={files}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Find and click the remove button
    const removeButton = screen.getByRole('button');
    await user.click(removeButton);

    // Check if onFileRemoved was called with correct index
    expect(mockOnFileRemoved).toHaveBeenCalledWith(0);
  });

  test('handles file input selection', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Create a mock file and trigger file selection
    const file = createMockFile('document.pdf', 'application/pdf', 1024);
    const input = screen.getByAccept('.pdf,.md,.txt,.docx,application/pdf,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // Simulate file selection
    await user.upload(input, file);

    // Check if onFilesAdded was called with the file
    expect(mockOnFilesAdded).toHaveBeenCalledWith([file]);
  });

  test('validates file size', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
        maxFileSizeMb={1}
      />
    );

    // Create a mock file larger than allowed
    const file = createMockFile('large.pdf', 'application/pdf', 2 * 1024 * 1024); // 2MB
    const input = screen.getByAccept('.pdf,.md,.txt,.docx,application/pdf,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // Simulate file selection
    await user.upload(input, file);

    // Check for error message
    expect(screen.getByTestId('error-message')).toHaveTextContent(/file size must be less than 1MB/i);

    // Check that onFilesAdded was not called
    expect(mockOnFilesAdded).not.toHaveBeenCalled();
  });

  test('validates file type', async () => {
    const user = userEvent.setup();
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Create a mock file with invalid type
    const file = createMockFile('image.jpg', 'image/jpeg', 1024);
    const input = screen.getByAccept('.pdf,.md,.txt,.docx,application/pdf,text/markdown,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    // Simulate file selection
    await user.upload(input, file);

    // Check for error message
    expect(screen.getByTestId('error-message')).toHaveTextContent(/unsupported file type/i);

    // Check that onFilesAdded was not called
    expect(mockOnFilesAdded).not.toHaveBeenCalled();
  });

  test('handles drag and drop events', () => {
    render(
      <FileUpload
        files={[]}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    const dropZone = screen.getByText(/drag & drop files or/i).parentElement!.parentElement!;

    // Simulate dragover
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('border-gold-500');

    // Simulate dragleave
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('border-gold-500');

    // Simulate drop with valid file
    const file = createMockFile('document.pdf', 'application/pdf', 1024);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    // Check that onFilesAdded was called with the file
    expect(mockOnFilesAdded).toHaveBeenCalledWith([file]);
  });

  test('formats file sizes correctly', () => {
    const files = [
      createMockFile('small.txt', 500, 'text/plain'),
      createMockFile('medium.md', 1500, 'text/markdown'),
      createMockFile('large.pdf', 1500000, 'application/pdf')
    ];

    render(
      <FileUpload
        files={files}
        onFilesAdded={mockOnFilesAdded}
        onFileRemoved={mockOnFileRemoved}
      />
    );

    // Check for formatted sizes
    expect(screen.getByText('500 B')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.getByText('1.4 MB')).toBeInTheDocument();
  });
});