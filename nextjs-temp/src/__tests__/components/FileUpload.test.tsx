import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from '@/components/FileUpload';

// Mock ErrorMessage component
jest.mock('@/components/ErrorMessage', () => {
  return function MockErrorMessage({ message }: { message: string, className?: string }) {
    if (!message) return null;
    return <div data-testid="error-message">{message}</div>;
  };
});

describe('FileUpload Component', () => {
  const mockFiles = [] as File[];
  const mockOnFilesAdded = jest.fn();
  const mockOnFileRemoved = jest.fn();

  beforeEach(() => {
    mockOnFilesAdded.mockClear();
    mockOnFileRemoved.mockClear();
  });

  // Helper to create test files
  const createFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', {
      get() {
        return size;
      }
    });
    return file;
  };

  it('renders without crashing', () => {
    render(
      <FileUpload 
        files={mockFiles} 
        onFilesAdded={mockOnFilesAdded} 
        onFileRemoved={mockOnFileRemoved} 
      />
    );
    
    expect(screen.getByText('Drag & drop files or')).toBeInTheDocument();
    expect(screen.getByText('browse')).toBeInTheDocument();
  });

  it('shows disabled state when disabled prop is true', () => {
    render(
      <FileUpload 
        files={mockFiles} 
        onFilesAdded={mockOnFilesAdded} 
        onFileRemoved={mockOnFileRemoved} 
        disabled={true} 
      />
    );
    
    expect(screen.getByText('Upload in progress...')).toBeInTheDocument();
  });

  it('displays uploaded files', () => {
    const testFiles = [
      createFile('test.pdf', 1000000, 'application/pdf'),
      createFile('test.md', 50000, 'text/markdown')
    ];
    
    render(
      <FileUpload 
        files={testFiles} 
        onFilesAdded={mockOnFilesAdded} 
        onFileRemoved={mockOnFileRemoved} 
      />
    );
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('test.md')).toBeInTheDocument();
    expect(screen.getByText('Selected Files')).toBeInTheDocument();
  });

  it('removes a file when remove button is clicked', () => {
    const testFiles = [
      createFile('test.pdf', 1000000, 'application/pdf')
    ];
    
    render(
      <FileUpload 
        files={testFiles} 
        onFilesAdded={mockOnFilesAdded} 
        onFileRemoved={mockOnFileRemoved} 
      />
    );
    
    // Find the delete button (using the SVG path's presence)
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    
    expect(mockOnFileRemoved).toHaveBeenCalledWith(0);
  });
  
  it('formats file size correctly', () => {
    const testFiles = [
      createFile('small.txt', 500, 'text/plain'),
      createFile('medium.md', 1500, 'text/markdown'),
      createFile('large.pdf', 1500000, 'application/pdf')
    ];
    
    render(
      <FileUpload 
        files={testFiles} 
        onFilesAdded={mockOnFilesAdded} 
        onFileRemoved={mockOnFileRemoved} 
      />
    );
    
    expect(screen.getByText('500 B')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.getByText('1.4 MB')).toBeInTheDocument();
  });
});