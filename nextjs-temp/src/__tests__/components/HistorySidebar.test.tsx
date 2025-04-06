import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HistorySidebar from '@/components/HistorySidebar';
import { formatDate, truncateText } from '@/utils/formatters';

// Mock Next.js usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/analysis/1',
}));

// Mock formatters
jest.mock('@/utils/formatters', () => ({
  formatDate: jest.fn((date) => 'Mocked Date'),
  truncateText: jest.fn((text, length) => 'Truncated Text'),
}));

describe('HistorySidebar', () => {
  const mockHistory = [
    { id: '1', filename: 'Document 1', summary: 'Summary of document 1', createdAt: '2023-01-01T00:00:00Z' },
    { id: '2', filename: 'Document 2', summary: 'Summary of document 2', createdAt: '2023-01-02T00:00:00Z' },
  ];
  
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders sidebar when isOpen is true', () => {
    render(<HistorySidebar history={mockHistory} isOpen={true} onClose={mockOnClose} />);
    
    // Check that the sidebar is visible
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('translate-x-0');
    
    // Check that history items are rendered
    expect(screen.getByText('Document 1')).toBeInTheDocument();
    expect(screen.getByText('Document 2')).toBeInTheDocument();
  });

  test('does not display sidebar content when isOpen is false', () => {
    render(<HistorySidebar history={mockHistory} isOpen={false} onClose={mockOnClose} />);
    
    // The sidebar should be hidden via CSS transform
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  test('displays empty state when history is empty', () => {
    render(<HistorySidebar history={[]} isOpen={true} onClose={mockOnClose} />);
    
    // No documents message should be displayed
    expect(screen.getByText('No documents analyzed yet')).toBeInTheDocument();
    expect(screen.getByText('Analyze your first document')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    render(<HistorySidebar history={mockHistory} isOpen={true} onClose={mockOnClose} />);
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close sidebar/i });
    await userEvent.click(closeButton);
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('formats date and truncates text correctly', () => {
    render(<HistorySidebar history={mockHistory} isOpen={true} onClose={mockOnClose} />);
    
    // Check that the formatDate and truncateText functions were called with correct arguments
    expect(formatDate).toHaveBeenCalledWith('2023-01-01T00:00:00Z');
    expect(formatDate).toHaveBeenCalledWith('2023-01-02T00:00:00Z');
    expect(truncateText).toHaveBeenCalledWith('Summary of document 1', 80);
    expect(truncateText).toHaveBeenCalledWith('Summary of document 2', 80);
    
    // Check that the formatted/truncated text is displayed
    const mockedDates = screen.getAllByText('Mocked Date');
    expect(mockedDates.length).toBe(2);
    
    const truncatedTexts = screen.getAllByText('Truncated Text');
    expect(truncatedTexts.length).toBe(2);
  });

  test('highlights currently active item based on pathname', () => {
    render(<HistorySidebar history={mockHistory} isOpen={true} onClose={mockOnClose} />);
    
    // Find all history items
    const items = screen.getAllByRole('listitem');
    
    // The first item should have the active class (based on mocked pathname '/analysis/1')
    // We'll look for the link element inside the first item
    const firstItemLink = items[0].querySelector('a');
    expect(firstItemLink).toHaveClass('bg-gray-100 dark:bg-gray-700');
    
    // The second item should not have the active class
    const secondItemLink = items[1].querySelector('a');
    expect(secondItemLink).not.toHaveClass('bg-gray-100 dark:bg-gray-700');
  });

  test('applies custom className when provided', () => {
    const customClassName = 'custom-class';
    render(
      <HistorySidebar 
        history={mockHistory} 
        isOpen={true} 
        onClose={mockOnClose} 
        className={customClassName} 
      />
    );
    
    // Check that the custom class is applied
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass(customClassName);
  });

  test('calls onClose when backdrop is clicked', async () => {
    render(<HistorySidebar history={mockHistory} isOpen={true} onClose={mockOnClose} />);
    
    // Find and click the backdrop
    const backdrop = screen.getByTestId('sidebar-backdrop');
    await userEvent.click(backdrop);
    
    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});