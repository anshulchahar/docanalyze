import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def analyze_text_with_gemini(text, api_key):
    """
    Analyze text using Google's Gemini API.
    
    Args:
        text (str): Text content to analyze
        api_key (str): Google Gemini API key
        
    Returns:
        dict: Analysis results
    """
    if not text:
        return {"error": "No text content provided for analysis"}
    
    try:
        # Configure the API
        genai.configure(api_key=api_key)
        
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
            full_text = response.text
            
            # Extract sections using basic parsing
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
        else:
            return {
                'summary': 'The AI model was unable to generate a summary.',
                'keyPoints': ['No key points could be extracted'],
                'detailedAnalysis': 'Analysis failed.',
                'documentComparison': 'No document comparison available.',
                'recommendations': 'No recommendations available.'
            }
            
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        return handle_api_error(e)  # Use the function here

def handle_api_error(error):
    """
    Handle API errors gracefully.
    
    Args:
        error: The exception that occurred
        
    Returns:
        dict: Error information
    """
    error_message = str(error)
    
    if "invalid api key" in error_message.lower():
        return {
            "error": "Invalid API key. Please check your Gemini API key and try again.",
            "summary": "Error: Invalid API key",
            "keyPoints": ["Analysis failed due to authentication error"],
            "detailedAnalysis": "The API key provided was invalid or has expired.",
            "documentComparison": "Not available due to API key error.",
            "recommendations": "Please check your API key and try again."
        }
    elif "quota exceeded" in error_message.lower():
        return {
            "error": "API quota exceeded. Please try again later or check your API usage limits.",
            "summary": "Error: API quota exceeded",
            "keyPoints": ["Analysis failed due to quota limitations"],
            "detailedAnalysis": "Your API quota has been exceeded for the current period.",
            "documentComparison": "Not available due to quota limits.",
            "recommendations": "Please try again later or upgrade your API plan."
        }
    else:
        return {
            "error": f"Failed to analyze text: {error_message}",
            "summary": f"Error analyzing document: {error_message}",
            "keyPoints": ["Analysis failed due to an error"],
            "detailedAnalysis": "The AI analysis encountered a problem.",
            "documentComparison": "Not available due to processing error.",
            "recommendations": "Not available due to processing error."
        }