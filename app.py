from flask import Flask, request, jsonify, render_template, url_for
import PyPDF2
import google.generativeai as genai
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Make sure to set static_folder
app = Flask(__name__, static_folder='static')

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_pdf():
    logger.debug("Starting PDF analysis request")
    
    if 'pdfFile' not in request.files:
        logger.error("No PDF file in request")
        return jsonify({'error': 'No PDF file provided'}), 400
    if 'apiKey' not in request.form:
        logger.error("No API key in request")
        return jsonify({'error': 'No API key provided'}), 400

    pdf_file = request.files['pdfFile']
    api_key = request.form['apiKey']

    if pdf_file.filename == '':
        logger.error("Empty PDF filename")
        return jsonify({'error': 'No selected PDF file'}), 400

    try:
        logger.debug(f"Extracting text from PDF: {pdf_file.filename}")
        pdf_text = extract_text_from_pdf(pdf_file)
        
        if not pdf_text.strip():
            logger.error("Extracted PDF text is empty")
            return jsonify({'error': 'Could not extract text from PDF. The file may be encrypted, damaged, or contain only images.'}), 400
        
        logger.debug(f"Text extracted successfully. Length: {len(pdf_text)} characters")
        logger.debug("Sending to Gemini API for analysis")
        
        # Call Gemini API
        ai_analysis = get_ai_analysis(pdf_text, api_key)
        
        logger.debug("Analysis completed successfully")
        return jsonify(ai_analysis)
    
    except PyPDF2.errors.PdfReadError as e:
        error_msg = f"PDF reading error: {str(e)}"
        logger.error(error_msg)
        return jsonify({'error': error_msg}), 400
    
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        logger.error(f"Error in analyze_pdf: {error_msg}")
        logger.error(traceback.format_exc())
        return jsonify({'error': error_msg}), 500

def extract_text_from_pdf(pdf_file):
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ''
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() or ""  # Handle None returns from extract_text
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        logger.error(traceback.format_exc())
        raise

def get_ai_analysis(pdf_text, api_key):
    """
    Analyze PDF text using Google's Gemini API and return structured insights.
    
    Args:
        pdf_text (str): The extracted text from the PDF document
        api_key (str): Google AI API key
        
    Returns:
        dict: Analysis results including summary, key points, and detailed information
    """
    try:
        # Configure the API
        logger.debug("Configuring Gemini API")
        genai.configure(api_key=api_key)
        
        # Create a model instance
        logger.debug("Creating Gemini model instance")
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Define the prompt for document analysis
        prompt = """
        Analyze the following document content comprehensively. 
        Focus on extracting the most important information and presenting it in a structured format.
        
        Provide the following:
        1. SUMMARY: A concise 2-3 paragraph summary of the main content
        2. KEY POINTS: A bullet list of 5-10 most important points/takeaways
        3. DETAILED ANALYSIS: A thorough analysis organized by main topics in the document
        4. RECOMMENDATIONS: Any actionable insights or recommendations based on the content
        
        Document content:
        {text}
        """
        
        # Send the request to Gemini
        logger.debug(f"Sending request to Gemini API with {len(pdf_text[:50000])} characters")
        response = model.generate_content(prompt.format(text=pdf_text[:50000]))  # Limiting text in case it's very large
        
        # Process the response
        if response.text:
            logger.debug("Received response from Gemini API")
            # Parse the sections from the response
            full_text = response.text
            
            # Extract sections using basic parsing
            sections = {
                'summary': '',
                'keyPoints': [],
                'detailedAnalysis': '',
                'recommendations': ''
            }
            
            # Simple parsing based on headers
            current_section = None
            logger.debug("Parsing response into sections")
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
                elif 'RECOMMENDATIONS:' in line or line.strip().startswith('RECOMMENDATIONS'):
                    current_section = 'recommendations'
                    continue
                
                if current_section:
                    if current_section == 'keyPoints' and (line.strip().startswith('-') or line.strip().startswith('•')):
                        sections[current_section].append(line.strip()[1:].strip())
                    elif current_section != 'keyPoints':
                        sections[current_section] += line + "\n"
            
            # Clean up the text sections
            for key in ['summary', 'detailedAnalysis', 'recommendations']:
                sections[key] = sections[key].strip()
                
            return sections
        else:
            return {
                'summary': 'The AI model was unable to generate a summary.',
                'keyPoints': ['No key points could be extracted'],
                'detailedAnalysis': 'Analysis failed.',
                'recommendations': 'No recommendations available.'
            }
            
    except Exception as e:
        logger.error(f"Error in AI analysis: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            'summary': f'Error analyzing document: {str(e)}',
            'keyPoints': ['Analysis failed due to an error'],
            'detailedAnalysis': 'The AI analysis encountered a problem.',
            'recommendations': 'Not available due to processing error.'
        }

if __name__ == '__main__':
    app.run(debug=True)
