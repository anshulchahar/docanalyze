import pytest
from unittest.mock import patch, MagicMock
import io
import json
import os

# Import the Flask app factory
from docanalyze import create_app

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestAppRoutes:
    
    def test_index_route(self, client):
        """Test the index route returns the expected HTML."""
        response = client.get('/')
        
        assert response.status_code == 200
        assert b'<!DOCTYPE html>' in response.data
        
    @patch('docanalyze.core.pdf.processor.extract_text_from_pdf')
    @patch('docanalyze.core.ai.gemini_handler.GeminiAPIHandler.analyze_text')
    def test_analyze_route_success(self, mock_analyze, mock_extract, client):
        """Test successful PDF analysis."""
        # Configure mocks
        mock_extract.return_value = "Sample extracted text from PDF"
        mock_analyze.return_value = {
            "summary": "Executive summary",
            "keyPoints": ["Key point 1", "Key point 2"],
            "detailedAnalysis": "Detailed analysis",
            "recommendations": "Recommendations"
        }
        
        # Create a test PDF content with proper PDF structure
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
        test_pdf = (io.BytesIO(test_content), 'test.pdf')
        
        # Make the request
        response = client.post(
            '/api/analyze', 
            data={
                'pdfFiles': test_pdf,
                'apiKey': 'DUMMY_API_KEY'
            },
            content_type='multipart/form-data'
        )
        
        # Check response
        assert response.status_code == 200
        data = json.loads(response.data)
        assert "summary" in data
        assert "keyPoints" in data
        assert "detailedAnalysis" in data
        assert "recommendations" in data
        
    def test_analyze_route_no_file(self, client):
        """Test behavior when no file is uploaded."""
        response = client.post(
            '/api/analyze',
            data={'apiKey': 'DUMMY_API_KEY'},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        
    def test_analyze_route_no_api_key(self, client):
        """Test behavior when no API key is provided."""
        # Create a test PDF file with proper structure
        test_content = b"%PDF-1.4\n%EOF"
        test_pdf = (io.BytesIO(test_content), 'test.pdf')
        
        response = client.post(
            '/api/analyze',
            data={'pdfFiles': test_pdf},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        
    @patch('docanalyze.core.pdf.processor.extract_text_from_pdf')
    def test_analyze_route_extraction_error(self, mock_extract, client):
        """Test behavior when PDF text extraction fails."""
        # Configure mock to raise an exception
        mock_extract.side_effect = Exception("Failed to extract text")
        
        # Create a test PDF file with proper structure
        test_content = b"%PDF-1.4\n%EOF"
        test_pdf = (io.BytesIO(test_content), 'test.pdf')
        
        response = client.post(
            '/api/analyze',
            data={
                'pdfFiles': test_pdf,
                'apiKey': 'DUMMY_API_KEY'
            },
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data