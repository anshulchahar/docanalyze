import google.generativeai as genai
import logging
import os
from typing import Dict, List, Union, Optional

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class GeminiAPIHandler:
    """Handler for interacting with Google's Gemini API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini API handler.
        
        Args:
            api_key: Google Gemini API key (optional if set in environment variables)
        """
        self.api_key = api_key or os.environ.get('GEMINI_API_KEY')
        if not self.api_key:
            logger.warning("No Gemini API key provided or found in environment variables")
            return
            
        try:
            # Configure the API
            genai.configure(api_key=self.api_key)
        except Exception as e:
            logger.error(f"Failed to configure Gemini API: {str(e)}")
            self.api_key = None
            # Store the error for later use
            self.init_error = str(e)
    
    def analyze_text(self, text: str) -> Dict[str, Union[str, List[str]]]:
        """
        Analyze text using Google's Gemini API.
        
        Args:
            text: Text content to analyze
            
        Returns:
            Dict: Analysis results with structured sections
        """
        if not text:
            return {"error": "No text content provided for analysis"}
        
        if not self.api_key:
            error_msg = "Invalid API key" if hasattr(self, 'init_error') else "No API key provided"
            return self._create_error_response(
                error_msg,
                error_msg,  # Use same message for summary
                ["Analysis failed due to API key error"],
                "The operation could not be completed due to an invalid API key.",
                "Please provide a valid Gemini API key and try again."
            )
        
        try:
            # Create a model instance
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Define the prompt for document analysis
            prompt = """
            Analyze the following document content comprehensively. 
            The content may include multiple documents, each separated by "--- DOCUMENT: [filename] ---".
            Focus on extracting the most important information and presenting it in a structured format.
            
            Provide the following:
            1. SUMMARY: A concise 2-3 paragraph summary of the main content across all documents
            2. KEY POINTS: A bullet list of 5-10 most important points/takeaways
            3. DETAILED ANALYSIS: A thorough analysis organized by main topics in the documents
            4. DOCUMENT COMPARISON: If multiple documents are provided, compare and contrast their key information
            5. RECOMMENDATIONS: Any actionable insights or recommendations based on the content
            
            Document content:
            {text}
            """
            
            # Send the request to Gemini
            response = model.generate_content(prompt.format(text=text[:50000]))  # Limiting text in case it's very large
            
            # Process the response
            if response.text:
                # Parse the sections from the response
                sections = self._parse_response(response.text)
                return sections
            else:
                return self._create_error_response("The AI model was unable to generate a response.")
                
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._handle_api_error(e)
    
    def _parse_response(self, full_text: str) -> Dict[str, Union[str, List[str]]]:
        """
        Parse the response from the Gemini API into structured sections.
        
        Args:
            full_text: Raw text response from Gemini API
            
        Returns:
            Dict: Structured analysis results
        """
        sections = {
            'summary': '',
            'keyPoints': [],
            'detailedAnalysis': '',
            'documentComparison': '',
            'recommendations': ''
        }
        
        # Simple parsing based on headers
        current_section = None
        for line in full_text.split('\n'):
            if 'SUMMARY:' in line or line.strip().startswith('SUMMARY'):
                current_section = 'summary'
                continue
            elif 'KEY POINTS:' in line or line.strip().startswith('KEY POINTS'):
                current_section = 'keyPoints'
                continue
            elif 'DETAILED ANALYSIS:' in line or line.strip().startswith('DETAILED ANALYSIS'):
                current_section = 'detailedAnalysis'
                continue
            elif 'DOCUMENT COMPARISON:' in line or line.strip().startswith('DOCUMENT COMPARISON'):
                current_section = 'documentComparison'
                continue
            elif 'RECOMMENDATIONS:' in line or line.strip().startswith('RECOMMENDATIONS'):
                current_section = 'recommendations'
                continue
            
            if current_section:
                if current_section == 'keyPoints' and (line.strip().startswith('-') or line.strip().startswith('•')):
                    sections[current_section].append(line.strip()[1:].strip())
                elif current_section != 'keyPoints':
                    sections[current_section] += line + "\n"
        
        # Clean up the text sections
        for key in ['summary', 'detailedAnalysis', 'documentComparison', 'recommendations']:
            sections[key] = sections[key].strip()
            
        return sections
    
    def _handle_api_error(self, error: Exception) -> Dict[str, str]:
        """
        Handle API errors gracefully.
        
        Args:
            error: The exception that occurred
            
        Returns:
            Dict: Error information
        """
        error_message = str(error)
        
        if "invalid api key" in error_message.lower():
            return self._create_error_response(
                "Invalid API key. Please check your Gemini API key and try again.",
                "Invalid API key",
                ["Analysis failed due to authentication error"],
                "The API key provided was invalid or has expired.",
                "Please check your API key and try again."
            )
        elif "quota exceeded" in error_message.lower():
            return self._create_error_response(
                "API quota exceeded. Please try again later or check your API usage limits.",
                "API quota exceeded",
                ["Analysis failed due to quota limitations"],
                "Your API quota has been exceeded for the current period.",
                "Please try again later or upgrade your API plan."
            )
        else:
            return self._create_error_response(
                f"Failed to analyze text: {error_message}",
                f"Error analyzing document: {error_message}",
                ["Analysis failed due to an error"],
                "The AI analysis encountered a problem.",
                "Not available due to processing error."
            )
    
    def _create_error_response(
        self, 
        error_msg: str, 
        summary: str = "", 
        key_points: List[str] = None, 
        detailed_analysis: str = "", 
        recommendations: str = ""
    ) -> Dict[str, Union[str, List[str]]]:
        """
        Create a standardized error response.
        
        Args:
            error_msg: Primary error message
            summary: Error summary message
            key_points: List of error-related points
            detailed_analysis: Detailed error explanation
            recommendations: Error recommendations
            
        Returns:
            Dict: Formatted error response
        """
        return {
            "error": error_msg,
            "summary": summary or error_msg,
            "keyPoints": key_points or ["Analysis failed due to an error"],
            "detailedAnalysis": detailed_analysis or "Analysis could not be completed.",
            "documentComparison": "Not available due to processing error.",
            "recommendations": recommendations or "Not available due to processing error."
        }

# For backward compatibility
def analyze_text_with_gemini(text, api_key):
    """
    Legacy function for backward compatibility.
    
    Args:
        text: Text content to analyze
        api_key: Google Gemini API key
        
    Returns:
        dict: Analysis results
    """
    handler = GeminiAPIHandler(api_key)
    return handler.analyze_text(text)