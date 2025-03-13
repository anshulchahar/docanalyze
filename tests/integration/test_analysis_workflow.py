import pytest
import os
from unittest.mock import patch, MagicMock
import tempfile
import io

# Add project root to Python path
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app import app  # Import your Flask app

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestAnalysisWorkflow:
    
    def create_sample_pdf(self):
        """Create a minimal valid PDF file for testing."""
        # Instead of trying to create a valid PDF, use a simple text file
        # that we'll mock to work with our PDF processor
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            f.write(b"This is sample text for testing purposes.")
            return f.name
    
    @patch('app.extract_text_from_pdf')  # Patch in app.py, not pdf_processor
    @patch('app.analyze_text_with_gemini')  # Patch in app.py, not gemini_api_handler
    def test_end_to_end_workflow(self, mock_gemini, mock_extract, client):
        """Test the complete PDF analysis workflow."""
        # Create a sample PDF
        pdf_path = self.create_sample_pdf()
        
        try:
            # Configure mocks
            mock_extract.return_value = "Sample extracted text for testing"
            
            mock_gemini.return_value = {
                "summary": "Test summary",
                "keyPoints": ["Test point 1", "Test point 2"],
                "detailedAnalysis": "Test analysis",
                "recommendations": "Test recommendation",
                "documentComparison": "Test comparison"
            }
            
            # Open the PDF file and read its content
            with open(pdf_path, 'rb') as pdf:
                pdf_content = pdf.read()
            
            # Make the request
            response = client.post(
                '/analyze',
                data={
                    'pdfFiles': (io.BytesIO(pdf_content), 'test.pdf'),
                    'apiKey': 'DUMMY_API_KEY'
                },
                content_type='multipart/form-data'
            )
            
            # Check response
            assert response.status_code == 200
            data = response.json
            
            # Check response structure
            assert "summary" in data
            assert "keyPoints" in data
            assert "detailedAnalysis" in data
            assert "recommendations" in data
            
        finally:
            # Clean up temporary file
            if os.path.exists(pdf_path):
                os.unlink(pdf_path)