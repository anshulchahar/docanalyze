import pytest
import os
from unittest.mock import patch
import tempfile

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
        # This is a minimal valid PDF file
        pdf_content = b'%PDF-1.3\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000102 00000 n \ntrailer << /Root 1 0 R /Size 4 >>\nstartxref\n178\n%%EOF'
        
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            f.write(pdf_content)
            return f.name
    
    @patch('app.analyze_text_with_gemini')
    def test_end_to_end_workflow(self, mock_gemini, client):
        """Test the complete PDF analysis workflow."""
        # Create a sample PDF
        pdf_path = self.create_sample_pdf()
        
        try:
            # Set up mock for Gemini API
            mock_gemini.return_value = {
                "summary": "Test summary",
                "keyPoints": "- Test point 1\n- Test point 2",
                "detailedAnalysis": "Test analysis",
                "recommendations": "1. Test recommendation"
            }
            
            # Open the PDF file
            with open(pdf_path, 'rb') as pdf:
                # Make the request
                response = client.post(
                    '/analyze',
                    data={
                        'pdfFiles': (pdf, 'test.pdf'),
                        'apiKey': 'DUMMY_API_KEY'
                    },
                    content_type='multipart/form-data'
                )
            
            # Check response
            assert response.status_code == 200
            data = response.json
            
            # Verify data structure
            assert "summary" in data
            assert "keyPoints" in data
            assert "detailedAnalysis" in data
            assert "recommendations" in data
            
            # Verify content (from our mock)
            assert data["summary"] == "Test summary"
            assert "Test point 1" in data["keyPoints"]
            assert data["detailedAnalysis"] == "Test analysis"
            assert "Test recommendation" in data["recommendations"]
            
        finally:
            # Clean up temporary file
            if os.path.exists(pdf_path):
                os.unlink(pdf_path)