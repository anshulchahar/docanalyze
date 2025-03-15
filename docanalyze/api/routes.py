"""
API routes for the DocAnalyze application.
"""
from flask import Blueprint, request, jsonify
import os
import logging
from typing import Dict, Any, List

# Import application components
from docanalyze.core.pdf.processor import extract_text_from_pdf, extract_metadata
from docanalyze.core.ai.gemini_handler import GeminiAPIHandler
from docanalyze.config.settings import get_config
from docanalyze.utils.helpers import validate_pdf_file, get_file_info

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/analyze', methods=['POST'])
def analyze_pdf():
    """API endpoint for analyzing PDF documents."""
    logger.debug("Starting PDF analysis request")
    
    if 'pdfFiles' not in request.files:
        logger.error("No PDF files in request")
        return jsonify({'error': 'No PDF files provided'}), 400
    
    pdf_files = request.files.getlist('pdfFiles')
    
    if not pdf_files or pdf_files[0].filename == '':
        logger.error("No PDF files selected")
        return jsonify({'error': 'No PDF files selected'}), 400
    
    # Get API key from configuration
    config = get_config()
    api_key = config.GEMINI_API_KEY
    
    if not api_key:
        logger.error("Gemini API key not configured")
        return jsonify({'error': 'Server configuration error: Gemini API key not set'}), 500
    
    try:
        # Process each PDF and combine the text
        combined_text = ""
        file_info = []
        
        for pdf_file in pdf_files:
            # Validate the PDF file
            is_valid, error_message = validate_pdf_file(pdf_file)
            if not is_valid:
                logger.error(f"Invalid PDF: {error_message} - {pdf_file.filename}")
                continue
                
            logger.debug(f"Extracting text from PDF: {pdf_file.filename}")
            pdf_text = extract_text_from_pdf(pdf_file)
            
            if pdf_text.strip():
                # Get metadata
                pdf_file.seek(0)  # Reset file pointer
                metadata = extract_metadata(pdf_file)
                
                # Store information about each file
                file_info.append({
                    'filename': pdf_file.filename,
                    'character_count': len(pdf_text),
                    'page_count': metadata.get('page_count', 0),
                    'metadata': metadata
                })
                
                # Add file content to combined text with separator
                combined_text += f"\n\n--- DOCUMENT: {pdf_file.filename} ---\n\n"
                combined_text += pdf_text
            else:
                logger.warning(f"Could not extract text from {pdf_file.filename}")
        
        if not combined_text.strip():
            logger.error("Extracted PDF text is empty from all files")
            return jsonify({
                'error': 'Could not extract text from any of the PDFs. The files may be encrypted, damaged, or contain only images.'
            }), 400
        
        logger.debug(f"Text extracted successfully from {len(file_info)} files. Total length: {len(combined_text)} characters")
        logger.debug("Sending to Gemini API for analysis")
        
        # Call Gemini API with combined text
        gemini_handler = GeminiAPIHandler(api_key)
        ai_analysis = gemini_handler.analyze_text(combined_text)
        
        # Add file information to response
        ai_analysis['fileInfo'] = file_info
        
        logger.debug("Analysis completed successfully")
        return jsonify(ai_analysis)
    
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        logger.error(f"Error in analyze_pdf: {error_msg}")
        logger.exception("Exception details:")
        return jsonify({'error': error_msg}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
    })