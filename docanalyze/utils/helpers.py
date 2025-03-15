"""
Helper utilities for the DocAnalyze application.
"""
import os
import uuid
from typing import Dict, Any, List, Optional, Tuple
import logging

# Configure logging
logger = logging.getLogger(__name__)

def generate_unique_id() -> str:
    """
    Generate a unique identifier.
    
    Returns:
        str: Unique identifier string
    """
    return str(uuid.uuid4())

def format_file_size(size_bytes: int) -> str:
    """
    Format file size from bytes to human-readable format.
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        str: Human-readable file size
    """
    if size_bytes == 0:
        return "0B"
        
    size_names = ("B", "KB", "MB", "GB", "TB")
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
        
    return f"{size_bytes:.2f}{size_names[i]}"

def safe_filename(filename: str) -> str:
    """
    Generate a safe filename for storage.
    
    Args:
        filename: Original filename
        
    Returns:
        str: Safe filename
    """
    base, ext = os.path.splitext(filename)
    safe_base = "".join([c for c in base if c.isalpha() or c.isdigit() or c in "-_"]).rstrip()
    timestamp = uuid.uuid4().hex[:8]
    return f"{safe_base}_{timestamp}{ext}"

def get_file_info(file_obj: Any) -> Dict[str, Any]:
    """
    Get file information in a standardized format.
    
    Args:
        file_obj: File object from request
        
    Returns:
        dict: Dictionary with file information
    """
    return {
        'filename': file_obj.filename,
        'content_type': file_obj.content_type,
        'size': file_obj.content_length or 0,
        'size_formatted': format_file_size(file_obj.content_length or 0)
    }

def validate_pdf_file(file_obj: Any) -> Tuple[bool, Optional[str]]:
    """
    Validate if a file is a valid PDF.
    
    Args:
        file_obj: File object from request
        
    Returns:
        tuple: (is_valid, error_message)
    """
    if not file_obj or file_obj.filename == '':
        return False, "No file selected"
        
    if not file_obj.filename.lower().endswith('.pdf'):
        return False, "File must be a PDF"
        
    # Basic content check
    content = file_obj.stream.read(5)
    file_obj.stream.seek(0)  # Reset file pointer
    
    if content != b'%PDF-':
        return False, "File is not a valid PDF"
        
    return True, None