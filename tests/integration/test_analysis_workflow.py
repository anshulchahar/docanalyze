import pytest
import os
from unittest.mock import patch, MagicMock
import tempfile
import io

# Import from the new structure
from docanalyze import create_app

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app = create_app('testing')
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        yield client

class TestAnalysisWorkflow:
    
    def create_sample_pdf(self):
        """Create a minimal valid PDF file for testing."""
        # Create a test file with proper PDF structure
        test_content = b"""%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 22>>stream
BT
/F1 12 Tf
(Test) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000111 00000 n
0000000212 00000 n
trailer
<</Size 5/Root 1 0 R>>
startxref
287
%%EOF"""
    
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            f.write(test_content)
            return f.name
    
    @patch('docanalyze.core.pdf.processor.extract_text_from_pdf')
    @patch('docanalyze.core.ai.gemini_handler.GeminiAPIHandler.analyze_text')
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
            
            # Make the request to the API endpoint
            response = client.post(
                '/api/analyze',
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