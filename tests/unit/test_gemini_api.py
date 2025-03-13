import pytest
from unittest.mock import patch, MagicMock

# Import your module
from gemini_api_handler import analyze_text_with_gemini  # Adjust import based on your file structure

class TestGeminiAPI:
    
    @pytest.fixture
    def mock_genai(self):
        """Create a mock for the Google Generative AI module."""
        with patch('gemini_api_handler.genai') as mock:
            # Configure the mock
            mock_gemini = MagicMock()
            mock.GenerativeModel.return_value = mock_gemini
            
            # Configure response
            mock_response = MagicMock()
            mock_response.text = """
            {
                "summary": "This is a sample executive summary.",
                "keyPoints": "- Key point 1\\n- Key point 2\\n- Key point 3",
                "detailedAnalysis": "Detailed analysis of the document...",
                "recommendations": "1. Recommendation one\\n2. Recommendation two"
            }
            """
            mock_gemini.generate_content.return_value = mock_response
            
            yield mock
    
    def test_analyze_text_with_gemini_success(self, mock_genai):
        """Test successful API request to Gemini."""
        # Sample text and API key
        text = "Sample document content for analysis."
        api_key = "DUMMY_API_KEY"
        
        # Call the function
        result = analyze_text_with_gemini(text, api_key)
        
        # Verify API was configured with the key
        mock_genai.configure.assert_called_once_with(api_key=api_key)
        
        # Verify GenerativeModel was created with correct model name
        mock_genai.GenerativeModel.assert_called_once()
        
        # Check the result contains expected keys
        assert "summary" in result
        assert "keyPoints" in result
        assert "detailedAnalysis" in result
        assert "recommendations" in result
        
    def test_analyze_text_with_gemini_invalid_api_key(self, mock_genai):
        """Test behavior with invalid API key."""
        # Configure mock to raise an exception for invalid API key
        mock_genai.configure.side_effect = Exception("Invalid API key")
        
        # Call the function
        result = analyze_text_with_gemini("Some text", "INVALID_KEY")
        
        # Check that the function returns an error response
        assert "error" in result
        assert "Invalid API key" in result["error"] or "Invalid API key" in result["summary"]
            
    def test_analyze_text_with_gemini_empty_text(self, mock_genai):
        """Test behavior with empty text."""
        result = analyze_text_with_gemini("", "DUMMY_API_KEY")
        
        # Check that the function handles empty text appropriately
        assert result.get("error") or result.get("summary") == ""
        
    def test_analyze_text_with_gemini_api_error(self, mock_genai):
        """Test behavior when API returns an error."""
        # Configure the mock to raise an exception during generate_content
        gemini_model = mock_genai.GenerativeModel.return_value
        gemini_model.generate_content.side_effect = Exception("API Error")
        
        # Call the function
        result = analyze_text_with_gemini("Some text", "DUMMY_API_KEY")
        
        # Check error was handled and returned in the response
        assert "error" in result
        assert "Failed to analyze text" in result["error"]
        assert "API Error" in result["summary"]