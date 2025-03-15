import pytest
from unittest.mock import patch, MagicMock

# Import your module with the new path
from docanalyze.core.ai.gemini_handler import analyze_text_with_gemini, GeminiAPIHandler

class TestGeminiAPI:
    
    @pytest.fixture
    def mock_genai(self):
        """Create a mock for the Google Generative AI module."""
        with patch('docanalyze.core.ai.gemini_handler.genai') as mock:
            # Configure the mock
            mock_gemini = MagicMock()
            mock.GenerativeModel.return_value = mock_gemini
            
            # Configure response
            mock_response = MagicMock()
            mock_response.text = """
            SUMMARY: This is a sample executive summary.
            
            KEY POINTS:
            - Key point 1
            - Key point 2
            - Key point 3
            
            DETAILED ANALYSIS: Detailed analysis of the document...
            
            RECOMMENDATIONS: 
            1. Recommendation one
            2. Recommendation two
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
        assert isinstance(result["keyPoints"], list)
        assert "detailedAnalysis" in result
        assert "recommendations" in result
    
    def test_gemini_api_handler_class(self, mock_genai):
        """Test the GeminiAPIHandler class implementation."""
        # Create handler instance
        handler = GeminiAPIHandler("DUMMY_API_KEY")
        
        # Test analyze_text method
        result = handler.analyze_text("Sample document content for analysis.")
        
        # Verify GenerativeModel was created
        mock_genai.GenerativeModel.assert_called_once()
        
        # Check the result contains expected keys
        assert "summary" in result
        assert isinstance(result["keyPoints"], list)
        assert "detailedAnalysis" in result
        assert "recommendations" in result
        
    def test_analyze_text_with_gemini_invalid_api_key(self, mock_genai):
        """Test behavior with invalid API key."""
        # Configure mock to raise an exception for invalid API key
        mock_genai.configure.side_effect = Exception("Invalid API key")
        
        # Call the function and expect an error response, not an exception
        result = analyze_text_with_gemini("Some text", "INVALID_KEY")
        
        # Check that the function returns an error response
        assert "error" in result
        assert "Invalid API key" in result["summary"]
            
    def test_analyze_text_with_gemini_empty_text(self, mock_genai):
        """Test behavior with empty text."""
        result = analyze_text_with_gemini("", "DUMMY_API_KEY")
        
        # Check that the function handles empty text appropriately
        assert "error" in result
        
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