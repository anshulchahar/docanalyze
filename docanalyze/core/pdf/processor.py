import pypdf  # Note the lowercase name
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_file):
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_file: File-like object containing PDF data
        
    Returns:
        str: Extracted text from the PDF
    """
    try:
        pdf_reader = pypdf.PdfReader(pdf_file)
        text = ''
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() or ""  # Handle None returns from extract_text
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        raise

def extract_metadata(pdf_file):
    """
    Extract metadata from a PDF file.
    
    Args:
        pdf_file: File-like object containing PDF data
        
    Returns:
        dict: Dictionary containing PDF metadata
    """
    try:
        pdf_reader = pypdf.PdfReader(pdf_file)
        metadata = {}
        
        # Extract available metadata
        if pdf_reader.metadata:
            for key, value in pdf_reader.metadata.items():
                # Clean up key name (remove leading '/')
                clean_key = key[1:] if key.startswith('/') else key
                metadata[clean_key] = value
                
        # Add page count
        metadata['page_count'] = len(pdf_reader.pages)
        
        return metadata
    except Exception as e:
        logger.error(f"Error extracting PDF metadata: {str(e)}")
        raise