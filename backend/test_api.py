"""
Test script for the Sustainability Lens API.
Run this to verify your backend is working correctly.
"""

import requests
import json
from pathlib import Path

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_upload_pdf(pdf_path: str):
    """Test PDF upload endpoint."""
    print(f"Testing PDF upload: {pdf_path}")
    
    if not Path(pdf_path).exists():
        print(f"Error: PDF file not found: {pdf_path}")
        return None
    
    with open(pdf_path, 'rb') as f:
        files = {'file': (Path(pdf_path).name, f, 'application/pdf')}
        response = requests.post(f"{BASE_URL}/api/upload", files=files)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Document ID: {result['id']}")
        print(f"Status: {result['status']}")
        print(f"Results URL: {result['results_url']}")
        return result['id']
    else:
        print(f"Error: {response.text}")
        return None

def test_get_results(doc_id: str):
    """Test getting analysis results."""
    print(f"Testing get results for document: {doc_id}")
    
    response = requests.get(f"{BASE_URL}/api/results/{doc_id}")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Processing status: {result['status']}")
        
        if result['status'] == 'ready' and result['results']:
            print(f"Found {len(result['results'])} ESG initiatives:")
            for i, match in enumerate(result['results'][:3], 1):  # Show first 3
                print(f"  {i}. {match['framework']} (Page {match['page_number']}, {match['confidence']}% confidence)")
                print(f"     Category: {match['category']}")
                print(f"     Evidence: {match['evidence'][:100]}...")
                print()
        
        if result.get('metadata'):
            meta = result['metadata']
            print(f"Document: {meta.get('document_name')}")
            print(f"Pages: {meta.get('total_pages')}")
            print(f"Extraction method: {meta.get('extraction_method')}")
    else:
        print(f"Error: {response.text}")

def test_download_pdf(doc_id: str):
    """Test PDF download endpoint."""
    print(f"Testing PDF download for document: {doc_id}")
    
    response = requests.get(f"{BASE_URL}/api/pdf/{doc_id}")
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type')}")
    print(f"Content-Length: {response.headers.get('content-length')} bytes")
    print()

def main():
    """Run all API tests."""
    print("=== Sustainability Lens API Test Suite ===\n")
    
    # Test 1: Health check
    test_health_check()
    
    # Test 2: Upload a PDF (you'll need to provide a test PDF)
    test_pdf_path = "test_document.pdf"  # Change this to your test PDF path
    
    if Path(test_pdf_path).exists():
        doc_id = test_upload_pdf(test_pdf_path)
        
        if doc_id:
            # Test 3: Get results
            test_get_results(doc_id)
            
            # Test 4: Download PDF
            test_download_pdf(doc_id)
    else:
        print(f"Skipping upload test - no PDF found at: {test_pdf_path}")
        print("To test upload, place a PDF file at the path above or update the path in this script.")
    
    print("=== Test Complete ===")

if __name__ == "__main__":
    main()