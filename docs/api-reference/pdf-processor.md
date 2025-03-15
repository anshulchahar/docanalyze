# PDF Processor API Reference

This page documents the PDF processing functionality available in DocAnalyze.

## PDF Processor Module

The `pdf_processor.py` module provides functions for extracting and processing text from PDF documents.

### `extract_text(file_path)`

Extracts text content from a PDF file.

**Parameters:**

- `file_path` (str): Path to the PDF file

**Returns:**

- `str`: Extracted text content from the PDF

**Example:**

```python
from pdf_processor import extract_text

text = extract_text("path/to/document.pdf")
print(text)
```

### `extract_metadata(file_path)`

Extracts metadata from a PDF file.

**Parameters:**

- `file_path` (str): Path to the PDF file

**Returns:**

- `dict`: Dictionary containing metadata such as:
  - `title`: Document title
  - `author`: Author name
  - `creator`: Creator application
  - `producer`: Producer application
  - `creation_date`: Date when the document was created
  - `modification_date`: Date when the document was last modified
  - `page_count`: Number of pages in the document

**Example:**

```python
from pdf_processor import extract_metadata

metadata = extract_metadata("path/to/document.pdf")
print(f"Document title: {metadata['title']}")
print(f"Author: {metadata['author']}")
print(f"Pages: {metadata['page_count']}")
```

### `process_pdf(file_path, options=None)`

Processes a PDF document and returns both text content and metadata.

**Parameters:**

- `file_path` (str): Path to the PDF file
- `options` (dict, optional): Configuration options for processing:
  - `extract_images` (bool): Whether to extract embedded images
  - `ocr` (bool): Whether to apply OCR on image-based content
  - `page_range` (tuple): Range of pages to process (e.g., `(1, 10)`)

**Returns:**

- `dict`: Dictionary containing:
  - `text`: Extracted text content
  - `metadata`: Document metadata
  - `pages`: List of page-specific content

**Example:**

```python
from pdf_processor import process_pdf

options = {
    "extract_images": False,
    "ocr": True,
    "page_range": (1, 5)
}

result = process_pdf("path/to/document.pdf", options)
print(f"Document text: {result['text'][:100]}...")  # First 100 chars
print(f"Total pages processed: {len(result['pages'])}")
```