# Application Routes Reference

This page documents the Flask application routes and API endpoints available in DocAnalyze.

## Web Interface Routes

### `GET /`

The main application route that renders the home page.

**Response:** HTML page with the document upload form.

### `GET /about`

About page with information about the application.

**Response:** HTML page with application information.

## API Endpoints

### `POST /api/upload`

Endpoint for uploading PDF documents.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the PDF document

**Response:**
```json
{
  "success": true,
  "file_id": "unique-file-identifier",
  "message": "File uploaded successfully"
}
```

### `POST /api/analyze/{file_id}`

Endpoint for analyzing a previously uploaded document.

**URL Parameters:**
- `file_id`: Unique identifier returned from the upload endpoint

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "analysis_type": "general",
  "options": {
    "extract_images": false,
    "ocr": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "summary": "Document summary...",
    "entities": ["Entity1", "Entity2"],
    "metadata": {
      "title": "Document Title",
      "author": "Author Name",
      "page_count": 10
    }
  }
}
```

### `POST /api/question/{file_id}`

Endpoint for asking questions about a document.

**URL Parameters:**
- `file_id`: Unique identifier returned from the upload endpoint

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "question": "What is the main topic of this document?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "The main topic of this document is..."
}
```

### `GET /api/documents`

Endpoint for retrieving a list of previously uploaded documents.

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "file_id": "unique-file-identifier-1",
      "filename": "document1.pdf",
      "upload_time": "2023-06-01T12:34:56",
      "size": 1024000,
      "analysis_status": "completed"
    },
    {
      "file_id": "unique-file-identifier-2",
      "filename": "document2.pdf",
      "upload_time": "2023-06-02T10:11:12",
      "size": 2048000,
      "analysis_status": "pending"
    }
  ]
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `415 Unsupported Media Type`: Unsupported file format
- `500 Internal Server Error`: Server-side error

Error responses include a JSON object with error details:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```