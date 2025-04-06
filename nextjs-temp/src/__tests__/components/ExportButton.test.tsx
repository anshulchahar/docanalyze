import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportButton from '@/components/ExportButton';
import * as exportUtils from '@/utils/exportUtils';

// Mock the exportUtils module
jest.mock('@/utils/exportUtils', () => ({
  exportAnalysis: jest.fn(),
}));

describe('ExportButton', () => {
  const mockAnalysis = {
    summary: 'Test summary',
    keyPoints: ['Point 1', 'Point 2'],
    detailedAnalysis: 'Detailed analysis text',
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    fileInfo: [
      {
        filename: 'test.pdf',
        character_count: 1000,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the export button', () => {
    render(<ExportButton analysis={mockAnalysis} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('shows export options when clicked', async () => {
    render(<ExportButton analysis={mockAnalysis} />);
    
    // Click the export button to open the dropdown
    await userEvent.click(screen.getByText('Export'));
    
    // Check that all export options are displayed
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
  });

  it('calls exportAnalysis with PDF format when PDF option is clicked', async () => {
    render(<ExportButton analysis={mockAnalysis} />);
    
    // Click the export button to open the dropdown
    await userEvent.click(screen.getByText('Export'));
    
    // Click the PDF option
    await userEvent.click(screen.getByText('PDF'));
    
    // Check that exportAnalysis was called with the correct parameters
    expect(exportUtils.exportAnalysis).toHaveBeenCalledWith('pdf', mockAnalysis);
  });

  it('calls exportAnalysis with markdown format when Markdown option is clicked', async () => {
    render(<ExportButton analysis={mockAnalysis} />);
    
    // Click the export button to open the dropdown
    await userEvent.click(screen.getByText('Export'));
    
    // Click the Markdown option
    await userEvent.click(screen.getByText('Markdown'));
    
    // Check that exportAnalysis was called with the correct parameters
    expect(exportUtils.exportAnalysis).toHaveBeenCalledWith('md', mockAnalysis);
  });

  it('calls exportAnalysis with text format when Plain Text option is clicked', async () => {
    render(<ExportButton analysis={mockAnalysis} />);
    
    // Click the export button to open the dropdown
    await userEvent.click(screen.getByText('Export'));
    
    // Click the Plain Text option
    await userEvent.click(screen.getByText('Plain Text'));
    
    // Check that exportAnalysis was called with the correct parameters
    expect(exportUtils.exportAnalysis).toHaveBeenCalledWith('txt', mockAnalysis);
  });

  it('handles export errors gracefully', async () => {
    // Mock console.error to track calls
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Make exportAnalysis throw an error
    (exportUtils.exportAnalysis as jest.Mock).mockRejectedValueOnce(new Error('Export failed'));
    
    render(<ExportButton analysis={mockAnalysis} />);
    
    // Click the export button to open the dropdown
    await userEvent.click(screen.getByText('Export'));
    
    // Click the PDF option
    await userEvent.click(screen.getByText('PDF'));
    
    // Wait for the promise to resolve
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
    });
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});