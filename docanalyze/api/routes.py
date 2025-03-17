"""
API routes for the DocAnalyze application.
"""
from flask import Blueprint, request, jsonify, send_file
import os
import logging
from typing import Dict, Any, List
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem
from reportlab.lib.units import inch

# Import application components
from docanalyze.core.pdf.processor import extract_text_from_pdf, extract_metadata
from docanalyze.core.ai.gemini_handler import GeminiAPIHandler
from docanalyze.config.settings import get_config
from docanalyze.utils.helpers import validate_pdf_file, get_file_info

# Add imports
from flask_login import current_user
from docanalyze.models import db, DocumentAnalysis

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
        
        # After successful analysis:
        if current_user.is_authenticated:
            # Save the analysis to the user's history
            analysis = DocumentAnalysis(
                user_id=current_user.id,
                filename=pdf_file.filename,
                analysis_data=ai_analysis
            )
            db.session.add(analysis)
            db.session.commit()
        
        return jsonify(ai_analysis)
    
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        logger.error(f"Error in analyze_pdf: {error_msg}")
        logger.exception("Exception details:")
        return jsonify({'error': error_msg}), 500

@api_bp.route('/convert-to-pdf', methods=['POST'])
def convert_to_pdf():
    """Convert content to PDF using ReportLab."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400

        data = request.get_json()
        if not data or 'html' not in data:
            return jsonify({'error': 'Content is required'}), 400

        # Create a buffer for the PDF
        buffer = BytesIO()

        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Create styles
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(
            name='CustomHeading1',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#333333')
        ))
        styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=styles['Heading2'],
            fontSize=18,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#444444')
        ))
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['Normal'],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#333333')
        ))

        # Parse the HTML-like content and convert to reportlab elements
        content = []
        
        # Add title
        content.append(Paragraph("Document Analysis Report", styles['CustomHeading1']))
        content.append(Spacer(1, 12))

        # Extract sections from the HTML-like content
        html = data['html']
        sections = html.split('<h2>')
        
        # Process each section
        for section in sections[1:]:  # Skip first empty part
            # Extract section title and content
            title_end = section.find('</h2>')
            if title_end != -1:
                title = section[0:title_end].strip()
                body = section[title_end + 5:].strip()
                
                # Add section title
                content.append(Paragraph(title, styles['CustomHeading2']))
                
                # Handle bullet points
                if '<ul>' in body and '</ul>' in body:
                    ul_start = body.find('<ul>')
                    ul_end = body.find('</ul>')
                    list_content = body[ul_start + 4:ul_end]
                    items = list_content.split('<li>')
                    bullets = []
                    for item in items[1:]:  # Skip first empty item
                        item_text = item.split('</li>')[0].strip()
                        bullets.append(ListItem(Paragraph(item_text, styles['CustomBody'])))
                    content.append(ListFlowable(
                        bullets,
                        bulletType='bullet',
                        start='•',
                        leftIndent=20,
                        bulletFontSize=8,
                        bulletOffsetY=2
                    ))
                else:
                    # Regular paragraph
                    paragraphs = body.replace('<p>', '').split('</p>')
                    for p in paragraphs:
                        if p.strip():
                            content.append(Paragraph(p.strip(), styles['CustomBody']))
                            content.append(Spacer(1, 12))

        # Build the PDF document
        doc.build(content)
        
        # Prepare the response
        buffer.seek(0)
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='analysis-report.pdf'
        )

    except Exception as e:
        logger.error(f"Error in PDF conversion: {str(e)}")
        logger.exception("Exception details:")
        return jsonify({'error': 'Failed to generate PDF'}), 500

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
    })