from flask import Flask, request, jsonify, render_template, url_for
import traceback
import logging
import os
from werkzeug.utils import secure_filename

# Import the functions from our modules
from pdf_processor import extract_text_from_pdf
from gemini_api_handler import analyze_text_with_gemini

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
    
    if 'pdfFiles' not in request.files:
        logger.error("No PDF files in request")
        return jsonify({'error': 'No PDF files provided'}), 400
    
    if 'apiKey' not in request.form:
        logger.error("No API key in request")
        return jsonify({'error': 'No API key provided'}), 400

    pdf_files = request.files.getlist('pdfFiles')
    api_key = request.form['apiKey']
    
    if not pdf_files or pdf_files[0].filename == '':
        logger.error("No PDF files selected")
        return jsonify({'error': 'No PDF files selected'}), 400
    
    try:
        # Process each PDF and combine the text
        combined_text = ""
        file_info = []
        
        for pdf_file in pdf_files:
            if not pdf_file.filename.lower().endswith('.pdf'):
                continue  # Skip non-PDF files
                
            logger.debug(f"Extracting text from PDF: {pdf_file.filename}")
            pdf_text = extract_text_from_pdf(pdf_file)
            
            if pdf_text.strip():
                # Store information about each file
                file_info.append({
                    'filename': pdf_file.filename,
                    'character_count': len(pdf_text)
                })
                combined_text += f"\n\n--- DOCUMENT: {pdf_file.filename} ---\n\n"
                combined_text += pdf_text
            else:
                logger.warning(f"Could not extract text from {pdf_file.filename}")
        
        if not combined_text.strip():
            logger.error("Extracted PDF text is empty from all files")
            return jsonify({'error': 'Could not extract text from any of the PDFs. The files may be encrypted, damaged, or contain only images.'}), 400
        
        logger.debug(f"Text extracted successfully from {len(file_info)} files. Total length: {len(combined_text)} characters")
        logger.debug("Sending to Gemini API for analysis")
        
        # Call Gemini API with combined text
        ai_analysis = analyze_text_with_gemini(combined_text, api_key)
        
        # Add file information to response
        ai_analysis['fileInfo'] = file_info
        
        logger.debug("Analysis completed successfully")
        return jsonify(ai_analysis)
    
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        logger.error(f"Error in analyze_pdf: {error_msg}")
        logger.error(traceback.format_exc())
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.run(debug=True)
