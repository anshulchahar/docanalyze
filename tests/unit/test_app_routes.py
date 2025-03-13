import pytest
from unittest.mock import patch, MagicMock
import io
import json
import os

# Import your Flask app
from app import app  # Adjust import based on your file structure

@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestAppRoutes:
    
    def test_index_route(self, client):
        """Test the index route returns the expected HTML."""
        response = client.get('/')
        
        assert response.status_code == 200
        assert b'<!DOCTYPE html>' in response.data
        assert b'PDF Analyzer' in response.data
        
    @patch('app.extract_text_from_pdf')
    @patch('app.analyze_text_with_gemini')
    def test_analyze_route_success(self, mock_analyze, mock_extract, client):
        """Test successful PDF analysis."""
        # Configure mocks
        mock_extract.return_value = "Sample extracted text from PDF"
        mock_analyze.return_value = {
            "summary": "Executive summary",
            "keyPoints": "Key points",
            "detailedAnalysis": "Detailed analysis",
            "recommendations": "Recommendations"
        }
        
        # Create a test PDF file
        test_pdf = (io.BytesIO(b'%PDF-fake pdf content'), 'test.pdf')
        
        # Make the request
        response = client.post(
            '/analyze', 
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
            '/analyze',
            data={'apiKey': 'DUMMY_API_KEY'},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        
    def test_analyze_route_no_api_key(self, client):
        """Test behavior when no API key is provided."""
        # Create a test PDF file
        test_pdf = (io.BytesIO(b'%PDF-fake pdf content'), 'test.pdf')
        
        response = client.post(
            '/analyze',
            data={'pdfFiles': test_pdf},
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert "error" in data
        
    @patch('app.extract_text_from_pdf')
    def test_analyze_route_extraction_error(self, mock_extract, client):
        """Test behavior when PDF text extraction fails."""
        # Configure mock to raise an exception
        mock_extract.side_effect = Exception("Failed to extract text")
        
        # Create a test PDF file
        test_pdf = (io.BytesIO(b'%PDF-fake pdf content'), 'test.pdf')
        
        response = client.post(
            '/analyze',
            data={
                'pdfFiles': test_pdf,
                'apiKey': 'DUMMY_API_KEY'
            },
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data