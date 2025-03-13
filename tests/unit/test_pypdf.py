import os
import tempfile
import pytest
from pypdf import PdfWriter
from pdf_processor import extract_text_from_pdf

def test_extract_text_from_pdf_with_pypdf():
    """Test that text extraction works with pypdf."""
    # Create a simple PDF with pypdf
    output = PdfWriter()
    output.add_blank_page(width=200, height=200)
    
    # Write to a temporary file
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
        output.write(f)
        temp_pdf_path = f.name
    
    try:
        # Test extraction
        with open(temp_pdf_path, 'rb') as pdf_file:
            extracted_text = extract_text_from_pdf(pdf_file)
        
        # A blank page should return empty string
        assert extracted_text == "" or extracted_text.isspace()
    finally:
        # Clean up
        if os.path.exists(temp_pdf_path):
            os.unlink(temp_pdf_path)