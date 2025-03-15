# Gemini API Integration Reference

This page documents the Google Gemini API integration in DocAnalyze.

## Gemini API Handler Module

The `gemini_api_handler.py` module provides functions for interacting with Google's Gemini API to analyze document content.

### `analyze_text(text, analysis_type="general")`

Analyzes text content using the Gemini API.

**Parameters:**

- `text` (str): Text content to analyze
- `analysis_type` (str, optional): Type of analysis to perform. Options include:
  - `"general"`: General purpose analysis (default)
  - `"summary"`: Text summarization
  - `"entities"`: Named entity recognition
  - `"sentiment"`: Sentiment analysis

**Returns:**

- `dict`: Analysis results with structure varying by analysis type

**Example:**

```python
from gemini_api_handler import analyze_text

text = "Your document text here..."
analysis = analyze_text(text, analysis_type="summary")
print(f"Summary: {analysis['summary']}")
```

### `ask_question(text, question)`

Asks a specific question about the document content.

**Parameters:**

- `text` (str): Document text content
- `question` (str): Question to ask about the document

**Returns:**

- `str`: Answer to the question

**Example:**

```python
from gemini_api_handler import ask_question

text = "Your document text here..."
question = "What is the main topic of this document?"
answer = ask_question(text, question)
print(f"Q: {question}")
print(f"A: {answer}")
```

### `batch_analyze(documents, analysis_type="general")`

Analyzes multiple documents in batch.

**Parameters:**

- `documents` (list): List of document text strings
- `analysis_type` (str, optional): Type of analysis to perform

**Returns:**

- `list`: List of analysis results corresponding to each document

**Example:**

```python
from gemini_api_handler import batch_analyze
from pdf_processor import extract_text
import os

# Extract text from multiple documents
documents = []
for filename in os.listdir("docs"):
    if filename.endswith(".pdf"):
        text = extract_text(f"docs/{filename}")
        documents.append(text)

# Analyze all documents
results = batch_analyze(documents, analysis_type="summary")

# Process results
for i, result in enumerate(results):
    print(f"Document {i+1} Summary: {result['summary']}")
```

## Configuration

The Gemini API integration requires an API key to be configured. This can be set:

1. In a `.env` file in the project root directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. As an environment variable:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

3. Programmatically:
   ```python
   import os
   os.environ["GEMINI_API_KEY"] = "your_api_key_here"
   ```