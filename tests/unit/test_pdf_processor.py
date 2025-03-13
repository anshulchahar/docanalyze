import os
import pytest
from unittest.mock import patch, MagicMock
import sys
import tempfile

# Add the parent directory to the path if needed
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Import your module
from pdf_processor import extract_text_from_pdf  # Adjust the import based on your actual file structure

class TestPdfProcessor:
    
    @pytest.fixture
    def sample_pdf_path(self):
        """Create a temporary PDF file for testing."""
        # For testing, we'll just use a path - we're mocking the actual file operations
        return "/path/to/sample.pdf"
        
    @pytest.fixture
    def mock_pypdf2(self):
        """Create a mock for PyPDF2."""
        with patch('pdf_processor.PyPDF2') as mock:
            # Configure mock to return expected values
            reader_mock = MagicMock()
            mock.PdfReader.return_value = reader_mock
            
            # Simulate a PDF with 2 pages
            page1 = MagicMock()
            page1.extract_text.return_value = "This is page 1 content."
            
            page2 = MagicMock()
            page2.extract_text.return_value = "This is page 2 content."
            
            reader_mock.pages = [page1, page2]
            reader_mock.__len__.return_value = 2
            
            yield mock
    
    def test_extract_text_from_pdf_success(self, sample_pdf_path, mock_pypdf2):
        """Test successful text extraction from PDF."""
        # Call the function
        result = extract_text_from_pdf(sample_pdf_path)
        
        # Assert PdfReader was called with the correct file path
        mock_pypdf2.PdfReader.assert_called_once_with(sample_pdf_path)
        
        # Assert the result contains text from all pages
        assert "This is page 1 content." in result
        assert "This is page 2 content." in result
        
    def test_extract_text_from_pdf_empty(self, mock_pypdf2):
        """Test behavior with empty PDF."""
        # Configure mock for empty PDF
        reader_mock = mock_pypdf2.PdfReader.return_value
        reader_mock.pages = []
        reader_mock.__len__.return_value = 0
        
        # Call the function
        result = extract_text_from_pdf("/path/to/empty.pdf")
        
        # Check result is empty or has appropriate message
        assert result == "" or "empty" in result.lower()
        
    def test_extract_text_from_pdf_file_not_found(self, mock_pypdf2):
        """Test behavior when PDF file is not found."""
        # Configure mock to raise FileNotFoundError
        mock_pypdf2.PdfReader.side_effect = FileNotFoundError("File not found")
        
        # Check that the function handles the exception appropriately
        with pytest.raises(FileNotFoundError):
            extract_text_from_pdf("/path/to/nonexistent.pdf")
            
    def test_extract_text_from_pdf_invalid_format(self, mock_pypdf2):
        """Test behavior with invalid PDF format."""
        # Configure mock to raise appropriate exception for invalid PDF
        mock_pypdf2.PdfReader.side_effect = Exception("Invalid PDF file")
        
        # Check that the function handles the exception appropriately
        with pytest.raises(Exception, match="Invalid PDF file"):
            extract_text_from_pdf("/path/to/invalid.pdf")