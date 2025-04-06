import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalysisResults from '@/components/AnalysisResults';
import { AnalysisData } from '@/types/analysis';

// Mock the DownloadButton component to avoid testing its functionality here
jest.mock('@/components/DownloadButton', () => ({
  __esModule: true,
  default: ({ analysisData, className }: { analysisData: any; className: string }) => (
    <button data-testid="download-button">Download</button>
  )
}));

describe('AnalysisResults', () => {
  const mockAnalysisData: AnalysisData = {
    id: '1',
    summary: 'This is a test summary',
    keyPoints: ['Point 1', 'Point 2', 'Point 3'],
    detailedAnalysis: 'This is a detailed analysis',
    recommendations: ['Recommendation 1', 'Recommendation 2'],
    documentComparison: 'This is a document comparison',
    fileInfo: [
      {
        filename: 'test-document.pdf',
        fileSize: '100KB',
        pages: 5
      }
    ],
    topics: ['Topic 1', 'Topic 2'],
    entities: ['Entity 1', 'Entity 2'],
    sentiment: 'Positive',
    language: 'English',
    createdAt: new Date().toISOString()
  };

  test('renders analysis results with all tabs', () => {
    render(<AnalysisResults analysis={mockAnalysisData} />);
    
    // Check that the main component renders
    expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    
    // Check that all tab buttons are present
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Key Points')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Comparison')).toBeInTheDocument();
    
    // Check that download button is present
    expect(screen.getByTestId('download-button')).toBeInTheDocument();
  });

  test('displays summary content by default', () => {
    render(<AnalysisResults analysis={mockAnalysisData} />);
    
    // Check that the summary is displayed
    expect(screen.getByText('This is a test summary')).toBeInTheDocument();
    
    // Check that file info is displayed
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  test('navigates between tabs correctly', async () => {
    const user = userEvent.setup();
    render(<AnalysisResults analysis={mockAnalysisData} />);
    
    // Click on Key Points tab and verify content
    await user.click(screen.getByText('Key Points'));
    expect(screen.getByText('Point 1')).toBeInTheDocument();
    expect(screen.getByText('Point 2')).toBeInTheDocument();
    
    // Click on Details tab and verify content
    await user.click(screen.getByText('Details'));
    expect(screen.getByText('This is a detailed analysis')).toBeInTheDocument();
    
    // Click on Recommendations tab and verify content
    await user.click(screen.getByText('Recommendations'));
    expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
    expect(screen.getByText('Recommendation 2')).toBeInTheDocument();
    
    // Click on Comparison tab and verify content
    await user.click(screen.getByText('Comparison'));
    expect(screen.getByText('This is a document comparison')).toBeInTheDocument();
  });

  test('handles missing data gracefully', () => {
    const incompleteAnalysis: AnalysisData = {
      id: '2',
      summary: '',
      keyPoints: [],
      detailedAnalysis: '',
      recommendations: [],
      documentComparison: '',
      fileInfo: [],
      topics: [],
      entities: [],
      sentiment: '',
      language: '',
      createdAt: new Date().toISOString()
    };
    
    render(<AnalysisResults analysis={incompleteAnalysis} />);
    
    // Check that "No summary available" is displayed
    expect(screen.getByText('No summary available.')).toBeInTheDocument();
    
    // Navigate to key points tab
    userEvent.click(screen.getByText('Key Points'));
    expect(screen.getByText('No key points available.')).toBeInTheDocument();
  });
});