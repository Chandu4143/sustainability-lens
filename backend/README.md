# Sustainability Lens Backend

FastAPI-based backend for PDF processing and ESG framework extraction.

## Features

- PDF upload and storage
- Text extraction using PyMuPDF (with pdfminer.six fallback)
- OCR processing for scanned documents using Tesseract
- Fuzzy matching of ESG frameworks and initiatives
- SQLite database for metadata storage
- RESTful API with comprehensive error handling

## Prerequisites

- Python 3.8+
- Tesseract OCR installed on system:
  - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
  - **macOS**: `brew install tesseract`
  - **Windows**: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)

## Installation

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Create directories:**
```bash
mkdir uploads
```

## Running the Server

```bash
# Development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

## API Endpoints

### 1. Upload PDF Document
```bash
curl -X POST "http://localhost:8000/api/upload" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@nike_report.pdf"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "ready",
  "results_url": "/api/results/550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Get Analysis Results
```bash
curl -X GET "http://localhost:8000/api/results/550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "status": "ready",
  "results": [
    {
      "id": "1",
      "framework": "Science Based Targets initiative",
      "description": "Nike has committed to science-based targets for reducing greenhouse gas emissions...",
      "evidence": "In addition to these 2030 targets aligned to the Science Based Targets initiative (SBTi)...",
      "page_number": 42,
      "confidence": 95,
      "category": "Environmental",
      "bbox": [10, 45, 90, 55]
    }
  ],
  "metadata": {
    "document_name": "nike_report.pdf",
    "total_pages": 85,
    "processing_time": 42,
    "extraction_method": "selectable"
  }
}
```

### 3. Download Original PDF
```bash
curl -X GET "http://localhost:8000/api/pdf/550e8400-e29b-41d4-a716-446655440000" \
     --output downloaded_report.pdf
```

### 4. Health Check
```bash
curl -X GET "http://localhost:8000/api/health"
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── utils/
│   └── extract.py         # PDF processing and text extraction
├── uploads/               # PDF file storage
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── sustainability_lens.db # SQLite database (created automatically)
```

## Configuration

Key configuration variables in `main.py`:
- `MAX_FILE_SIZE`: Maximum upload size (default: 50MB)
- `UPLOAD_DIR`: Directory for PDF storage
- `DB_PATH`: SQLite database path

## Text Extraction Strategy

1. **Primary**: PyMuPDF extracts selectable text with layout information
2. **Fallback**: If extracted text < 200 characters, run Tesseract OCR
3. **Bounding Boxes**: Computed using layout analysis (approximated for MVP)
4. **Framework Matching**: Fuzzy string matching against 15+ ESG frameworks

## ESG Frameworks Detected

The system can identify 15+ major ESG frameworks including:
- Science Based Targets initiative (SBTi)
- Social & Labor Convergence Program (SLCP)
- Global Reporting Initiative (GRI)
- Task Force on Climate-related Financial Disclosures (TCFD)
- Zero Discharge of Hazardous Chemicals (ZDHC)
- Fair Labor Association (FLA)
- UN Global Compact
- And more...

## Error Handling

- File validation (PDF only, size limits)
- Database error handling
- PDF processing error recovery
- Comprehensive logging

## Development

Run tests:
```bash
pytest
```

Format code:
```bash
black main.py utils/
```

## Production Deployment

For production deployment:
1. Use proper database (PostgreSQL)
2. Add authentication/authorization
3. Implement background task processing
4. Add file storage service (S3)
5. Configure proper logging
6. Add monitoring and health checks
7. Use Docker containers
8. Set up reverse proxy (nginx)

## Troubleshooting

**Tesseract not found:**
- Ensure Tesseract is installed and in PATH
- On Windows, you may need to set `pytesseract.pytesseract.tesseract_cmd`

**Memory issues:**
- Large PDFs may consume significant memory
- Consider implementing streaming processing for production

**Accuracy issues:**
- OCR accuracy depends on document quality
- Fine-tune fuzzy matching thresholds in `utils/extract.py`