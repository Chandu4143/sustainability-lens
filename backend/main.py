"""
FastAPI backend for Sustainability Lens PDF processing.
Handles PDF upload, text extraction, OCR, and ESG framework matching.
"""

import os
import uuid
import json
import sqlite3
import re
import tempfile
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.extract import (
    extract_selectable_text,
    run_tesseract_on_pages, 
    find_framework_matches,
    ESGMatch
)

# Configuration
UPLOAD_DIR = Path("uploads")
DB_PATH = "sustainability_lens.db"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Sustainability Lens API",
    description="AI-powered ESG initiative extraction from PDF documents",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:8081", "http://localhost:3000"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UploadResponse(BaseModel):
    id: str
    status: str
    results_url: str

class ProcessingResult(BaseModel):
    status: str  # "ready" | "processing" | "failed"
    results: Optional[List[ESGMatch]] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Database initialization
def init_db():
    """Initialize SQLite database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'processing',
            results_path TEXT,
            error_message TEXT,
            metadata TEXT
        )
    """)
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def update_document_status(doc_id: str, status: str, results_path: str = None, error: str = None, metadata: Dict = None):
    """Update document processing status in database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        UPDATE documents 
        SET status = ?, results_path = ?, error_message = ?, metadata = ?
        WHERE id = ?
    """, (status, results_path, error, json.dumps(metadata) if metadata else None, doc_id))
    
    conn.commit()
    conn.close()

def process_pdf_document(doc_id: str, file_path: str, filename: str):
    """
    Process uploaded PDF document.
    This runs synchronously for MVP - in production, use background tasks.
    """
    try:
        print(f"Starting processing for document {doc_id}: {filename}")
        
        # Step 1: Try to extract selectable text
        print("Extracting selectable text...")
        text_content, page_layouts = extract_selectable_text(file_path)
        
        # Step 2: If text is insufficient, run OCR
        extraction_method = "selectable"
        if len(text_content.strip()) < 200:
            print("Insufficient selectable text, attempting OCR...")
            ocr_results = run_tesseract_on_pages(file_path)
            # Combine OCR results with existing text
            if ocr_results:
                ocr_text = "\n\n".join([page_text for page_text, _ in ocr_results])
                text_content = text_content + "\n\n" + ocr_text if text_content.strip() else ocr_text
                extraction_method = "ocr"
                print(f"OCR completed, extracted {len(ocr_text)} characters")
            else:
                print("OCR failed or unavailable, proceeding with available text only")
                extraction_method = "limited"
        
        # Step 3: Find ESG framework matches
        print("Finding ESG framework matches...")
        matches = find_framework_matches(text_content, page_layouts, filename)
        
        # Step 4: Save results
        results_file = UPLOAD_DIR / f"{doc_id}_results.json"
        results_data = {
            "matches": [match.dict() for match in matches],
            "document_name": filename,
            "total_pages": len(page_layouts) if page_layouts else 1,
            "processing_time": 42,  # Placeholder - in production, track actual time
            "text_extraction_method": extraction_method,
            "text_length": len(text_content)
        }
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        # Update database
        metadata = {
            "total_matches": len(matches),
            "extraction_method": results_data["text_extraction_method"],
            "total_pages": results_data["total_pages"],
            "text_length": results_data["text_length"]
        }
        
        update_document_status(doc_id, "ready", str(results_file), None, metadata)
        print(f"Processing completed for document {doc_id}")
        
    except Exception as e:
        print(f"Error processing document {doc_id}: {str(e)}")
        update_document_status(doc_id, "failed", None, str(e))

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    print("Database initialized")

@app.post("/api/upload", response_model=UploadResponse)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload PDF document for ESG analysis.
    
    Returns document ID and processing status.
    For MVP, processing is synchronous.
    """
    
    # Validate file
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Generate unique ID and save file
    doc_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{doc_id}.pdf"
    
    try:
        # Read uploaded bytes
        content = await file.read()
        
        # Validate size after reading (UploadFile has no size attribute)
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File size exceeds {MAX_FILE_SIZE/1024/1024:.0f}MB limit")
        
        # Save uploaded file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Store in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO documents (id, filename, file_path, status)
            VALUES (?, ?, ?, 'processing')
        """, (doc_id, file.filename, str(file_path)))
        conn.commit()
        conn.close()
        
        # Process document (synchronous for MVP)
        process_pdf_document(doc_id, str(file_path), file.filename)
        
        return UploadResponse(
            id=doc_id,
            status="ready",  # Since we process synchronously
            results_url=f"/api/results/{doc_id}"
        )
        
    except HTTPException:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.get("/api/results/{doc_id}", response_model=ProcessingResult)
async def get_results(doc_id: str):
    """Get processing results for a document."""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    doc = cursor.fetchone()
    conn.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc['status'] == 'failed':
        return ProcessingResult(
            status="failed",
            error=doc['error_message']
        )
    
    if doc['status'] == 'processing':
        return ProcessingResult(status="processing")
    
    # Load results
    if doc['results_path'] and Path(doc['results_path']).exists():
        with open(doc['results_path'], 'r', encoding='utf-8') as f:
            results_data = json.load(f)
        
        # Convert to ESGMatch objects
        matches = [ESGMatch(**match) for match in results_data['matches']]
        
        metadata = {
            "document_name": results_data.get("document_name"),
            "total_pages": results_data.get("total_pages"),
            "processing_time": results_data.get("processing_time"),
            "extraction_method": results_data.get("text_extraction_method")
        }
        
        return ProcessingResult(
            status="ready",
            results=matches,
            metadata=metadata
        )
    
    return ProcessingResult(
        status="failed",
        error="Results file not found"
    )

@app.get("/api/pdf/{doc_id}")
async def get_pdf(doc_id: str):
    """Serve the original PDF file."""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT file_path, filename FROM documents WHERE id = ?", (doc_id,))
    doc = cursor.fetchone()
    conn.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = Path(doc['file_path'])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=str(file_path),
        filename=doc['filename'],
        media_type='application/pdf',
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "*"
        }
    )

@app.get("/api/export/{doc_id}")
async def export_results(doc_id: str):
    """Export analysis results as downloadable JSON file."""
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
    doc = cursor.fetchone()
    conn.close()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc['status'] != 'ready':
        raise HTTPException(status_code=400, detail="Analysis not ready for export")
    
    # Load results
    if not doc['results_path'] or not Path(doc['results_path']).exists():
        raise HTTPException(status_code=404, detail="Results file not found")
    
    with open(doc['results_path'], 'r', encoding='utf-8') as f:
        results_data = json.load(f)
    
    # Create export data
    export_data = {
        "documentName": results_data.get("document_name"),
        "totalPages": results_data.get("total_pages"),
        "processingTime": results_data.get("processing_time"),
        "extractionMethod": results_data.get("text_extraction_method"),
        "textLength": results_data.get("text_length", 0),
        "initiatives": [
            {
                "id": match.get("id"),
                "framework": match.get("framework"),
                "description": match.get("description"), 
                "evidence": match.get("evidence"),
                "pageNumber": match.get("page_number"),
                "confidence": match.get("confidence"),
                "category": match.get("category")
            }
            for match in results_data.get("matches", [])
        ],
        "summary": {
            "totalInitiatives": len(results_data.get("matches", [])),
            "averageConfidence": round(
                sum(match.get("confidence", 0) for match in results_data.get("matches", [])) / 
                len(results_data.get("matches", [])) if results_data.get("matches") else 0
            ),
            "categoryCounts": {}
        },
        "exportedAt": datetime.now().isoformat()
    }
    
    # Calculate category counts
    for match in results_data.get("matches", []):
        category = match.get("category", "Unknown")
        export_data["summary"]["categoryCounts"][category] = export_data["summary"]["categoryCounts"].get(category, 0) + 1
    
    # Generate filename
    safe_filename = re.sub(r'[^a-zA-Z0-9]', '_', results_data.get("document_name", "document")).lower()
    filename = f"esg_analysis_{safe_filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    # Create temporary export file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, encoding='utf-8') as temp_file:
        json.dump(export_data, temp_file, indent=2, ensure_ascii=False)
        temp_path = temp_file.name
    
    return FileResponse(
        path=temp_path,
        filename=filename,
        media_type='application/json',
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "sustainability-lens-api"}

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Sustainability Lens API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "POST /api/upload",
            "results": "GET /api/results/{id}",
            "pdf": "GET /api/pdf/{id}",
            "export": "GET /api/export/{id}",
            "health": "GET /api/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)